
// Web Bluetooth API
// https://developer.chrome.com/articles/bluetooth/

import { useState, useEffect } from "react";
import { db, auth } from '@/lib/firebase';
import { getDoc, doc } from "firebase/firestore";

export default function ConnectBLE_Camera() {

    // get user firebase id
    const uid = auth.currentUser.uid;
    // Get UUID's from firestore
    const petCamUUIDref = doc(db,'users',`${uid}`,'ble_uuid','petcamera');
    // console.log(petCamUUIDref);
    
    const [myCameraTower, setMyCameraTower] = useState();
    const [writeCharacteristic, setWriteCharacteristic] = useState();
    const [notifyCharacteristic, setNotifyCharacteristic] = useState();

    async function getFBdata(Ref) {
        const petCamSnap = await getDoc(Ref);
        if (petCamSnap.exists()) {
            // console.log("Document data:", petCamSnap.data());

            setMyCameraTower(petCamSnap.data().serviceUUID);
            setWriteCharacteristic(petCamSnap.data().writeUUID);
            setNotifyCharacteristic(petCamSnap.data().notifyUUID);

          } else {
            console.log("No such document!");
        }
    }

    getFBdata(petCamUUIDref);

    const [cameraTowerDevice, setCameraTowerDevice] = useState(null);
    const [cameraTowerService, setCameraTowerService] = useState(null);

    const [formValue, setFormValue] = useState('');
    const [passValue, setPassValue] = useState('');

    const [connected, setConnected] = useState();

    const [notifyValue, setNotifyValue] = useState("");

    const handleNotification = (event) => {
        const value = event.target.value;
        const decoder = new TextDecoder();
        const message = decoder.decode(value);
        setNotifyValue(message);
    };
    const handleChange = (e) => {
        setFormValue(e.target.value);
    };
    const handlePassChange = (e) => {
        setPassValue(e.target.value);
    };

    // Subscribe to notifications when the cameraTowerService is set
    useEffect(() => {
        if (cameraTowerService) {
        cameraTowerService
            .getCharacteristic(notifyCharacteristic)
            .then((characteristic) => {
            return characteristic.startNotifications();
            })
            .then((characteristic) => {
            characteristic.addEventListener(
                "characteristicvaluechanged",
                handleNotification
            );
            })
            .catch((error) => {
            console.log(error);
            });
        }
    }, [cameraTowerService]);

    async function BTConnect(){
        navigator.bluetooth.requestDevice({
            filters: [{
            services: [myCameraTower]
            }]
        })
        .then(device => {
            setCameraTowerDevice(device);
            return device.gatt.connect()
        })
        .then(server => server.getPrimaryService(myCameraTower))
        .then(service => {
            setCameraTowerService(service);
            if (service) {
                setConnected(true);
            }
        })
        .then(service => {
          return service;
        })
        .catch(error => { console.log(error); });
    }

    async function sendMessage() {
        const message = formValue+":"+passValue;
        const encoder = new TextEncoder('utf-8');
        const data = encoder.encode(message);

        if(!cameraTowerService)
        {
            console.log("No camera tower service")
            return;
        }
        return cameraTowerService.getCharacteristic(writeCharacteristic)
        .then(characteristic => {
            return characteristic.writeValue(data);
        })
        .then(_ => {
            console.log('sent message');
        })
        .catch(error => { console.log(error); });
    }

    return (
        <>
            <h3>Setup Pet Camera with Bluetooth</h3>
            <h2>1. Connect With Below</h2>
            <button onClick={BTConnect}> Connect 🔹</button>
            {connected ? <p> ✅ <strong>Connected!</strong> </p>
            : <p> ❌ Not Connected </p>}
            <h2>2. Send WIFI Username (SSID) and Password for your Pet Camera</h2>
            <input name='messageInput' placeholder="Enter Username" value={formValue} onChange={handleChange}/>
            <input name='messagePassInput' placeholder="Enter Password" value={passValue} onChange={handlePassChange}/>
            <button onClick={sendMessage}> Send 📧➡️</button>
            {notifyValue && <strong>✅ Device Connected to Wifi</strong>}
        </>
    );
}