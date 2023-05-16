
// Web Bluetooth API
// https://developer.chrome.com/articles/bluetooth/

export default function ConnectBLE() {

    // Both values below will need to be in firebase user profile based on esp32 they have
    var myESP32 = 'd804b643-6ce7-4e81-9f8a-ce0f699085eb'
    var helloCharacteristic = 'c8659212-af91-4ad3-a995-a58d6fd26145'

    async function BTConnect() {
        navigator.bluetooth.requestDevice({
        filters: [{
            services: [myESP32]
        }],
        })
        .then(device => {
            // Connect to device
            console.log(device.name);
            device.gatt.connect();
        })
        .then(server => {
            return server.getPrimaryService(myESP32);
        })
        .catch(error => { console.log(error); });
    }

    async function BTConnect_Iter() {
        navigator.bluetooth.requestDevice({
        filters: [{
            services: [myESP32]
        }],
        })
        .then(device => {
            // Connect to device
            console.log(device.name);
            device.gatt.connect();
        })
        .then(server => {
            // Get ESP32 service
            return server.getPrimaryService(myESP32);
        })
        .then(service => {
            // Get print value characteristic
            return service.getCharacteristic(helloCharacteristic);
        })
        .then(characteristic => {
            // Set up event listener for when characteristic value changes
            characteristic.addEventListener('characteristicvaluechanged',
                                                handleChange);
            // Read print value
            return characteristic.readValue();
        })
        .catch(error => { console.log(error); });
    }

    async function handleChange(event) {
        const printValue = event.target.value.getUint8(0);
        console.log('Increment value is ' + printValue);
    }

    return (
        <>
            <h3>Robot BLE</h3>
            <button onClick={BTConnect_Iter}> Connect to bluetooth </button>
        </>
    );
}