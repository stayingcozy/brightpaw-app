
// Web Bluetooth API
// https://developer.chrome.com/articles/bluetooth/

import { useState } from "react";

export default function ConnectBLE_Camera() {

    // TODO - Both values below will need to be in firebase user profile based on cameraTower they have
    var myCameraTower = 'fb0af608-c3ad-41bb-9aba-6d8185f45de7'
    // var helloCharacteristic = 'c8659212-af91-4ad3-a995-a58d6fd26145'
    var writeCharacteristic = '0cb87266-9c1e-4e8b-a317-b742364e03b4'

    let cameraTowerDevice = null;
    let cameraTowerService = null;

    const [formValue, setFormValue] = useState('');

    const handleChange = (e) => {
        setFormValue(e.target.value);
    };

    async function BTConnect(){
        navigator.bluetooth.requestDevice({
            filters: [{
            services: [myCameraTower]
            }]
        })
        .then(device => {
            cameraTowerDevice = device;
            return device.gatt.connect()
        })
        .then(server => server.getPrimaryService(myCameraTower))
        .then(service => {
            cameraTowerService = service;
        })
        .then(service => {
          return service;
        })
        .catch(error => { console.log(error); });
    }

    async function sendMessage() {
        const message = formValue;
        // const message = messageInput.value;
        const encoder = new TextEncoder('utf-8');
        const data = encoder.encode(message);

        if(!cameraTowerService)
        {
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
            <h3>Camera Tower BLE</h3>
            <button onClick={BTConnect}> Connect 🔹</button>
            <input name='messageInput' placeholder="Enter Message" value={formValue} onChange={handleChange}/>
            <button onClick={sendMessage}> 📧➡️</button>

        </>
    );
}