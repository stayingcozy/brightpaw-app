
// Web Bluetooth API
// https://developer.chrome.com/articles/bluetooth/

export default function ConnectBLE() {

    // Both values below will need to be in firebase user profile based on esp32 they have
    var myESP32 = 'd804b643-6ce7-4e81-9f8a-ce0f699085eb'
    var helloCharacteristic = 'c8659212-af91-4ad3-a995-a58d6fd26145'
    var writeCharacteristic = 'beb5483e-36e1-4688-b7f5-ea07361b26a8'

    let esp32Device = null;
    let esp32Service = null;


    /////////////////////////////////////////////////
    // Test functions
    /////////////////////////////////////////////////

    async function BTConnect_Read() {
        // only works on connect (callback)
        // check out notifyCallback for Web BLE API, so it can print out every notify from server
        navigator.bluetooth.requestDevice({
            filters: [{
                services: [myESP32]
            }]
        })
        .then(device => {
            return device.gatt.connect()
        })
        .then(server => server.getPrimaryService(myESP32))
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
    
    async function BTConnect_Write() {
        navigator.bluetooth.requestDevice({
            filters: [{
                services: [myESP32]
            }]
        })
        .then(device => {
            return device.gatt.connect()
        })
        .then(server => server.getPrimaryService(myESP32))
        .then(service => {
            // Get print value characteristic
            return service.getCharacteristic(writeCharacteristic);
        })
        .then(characteristic => {
            const writeValue = Uint8Array.of(2);
            return characteristic.writeValueWithoutResponse(writeValue);
        })
        .then(_ => {
            console.log('Value has been written.');
        })
        .catch(error => { console.log(error); });
    }
    /////////////////////////////////////////////////

    async function BTConnect(){
        navigator.bluetooth.requestDevice({
            filters: [{
            services: [myESP32]
            }]
        })
        .then(device => {
            esp32Device = device;
            return device.gatt.connect()
        })
        .then(server => server.getPrimaryService(myESP32))
        .then(service => {
            esp32Service = service;
        })
        .then(service => {
          return service;
        })
        .catch(error => { console.log(error); });
    }

    async function BTUpUp() {
        if(!esp32Service)
        {
            return;
        }
        return esp32Service.getCharacteristic(writeCharacteristic)
        .then(characteristic => {
            const writeValue = Uint8Array.of(200); //255 make the motor smoke no holder or shell
            return characteristic.writeValueWithoutResponse(writeValue);
        })
        .then(_ => {
            console.log('Up');
        })
        .catch(error => { console.log(error); });
    }

    async function BTUp() {
        if(!esp32Service)
        {
            return;
        }
        return esp32Service.getCharacteristic(writeCharacteristic)
        .then(characteristic => {
            const writeValue = Uint8Array.of(150);
            return characteristic.writeValueWithoutResponse(writeValue);
        })
        .then(_ => {
            console.log('Up');
        })
        .catch(error => { console.log(error); });
    }

    async function BTStop() {
        if(!esp32Service)
        {
            return;
        }
        return esp32Service.getCharacteristic(writeCharacteristic)
        .then(characteristic => {
            const writeValue = Uint8Array.of(125);
            return characteristic.writeValueWithoutResponse(writeValue);
        })
        .then(_ => {
            console.log('Stop');
        })
        .catch(error => { console.log(error); });
    }

    async function BTDown() {
        if(!esp32Service)
        {
            return;
        }
        return esp32Service.getCharacteristic(writeCharacteristic)
        .then(characteristic => {
            const writeValue = Uint8Array.of(100);
            return characteristic.writeValueWithoutResponse(writeValue);
        })
        .then(_ => {
            console.log('Down');
        })
        .catch(error => { console.log(error); });
    }

    async function BTDownDown() {
        if(!esp32Service)
        {
            return;
        }
        return esp32Service.getCharacteristic(writeCharacteristic)
        .then(characteristic => {
            const writeValue = Uint8Array.of(60);
            return characteristic.writeValueWithoutResponse(writeValue);
        })
        .then(_ => {
            console.log('Down');
        })
        .catch(error => { console.log(error); });
    }

    async function BTLeft() {
        if(!esp32Service)
        {
            return;
        }
        return esp32Service.getCharacteristic(writeCharacteristic)
        .then(characteristic => {
            const writeValue = Uint8Array.of(3);
            return characteristic.writeValueWithoutResponse(writeValue);
        })
        .then(_ => {
            console.log('Left');
        })
        .catch(error => { console.log(error); });
    }

    async function BTRight() {
        if(!esp32Service)
        {
            return;
        }
        return esp32Service.getCharacteristic(writeCharacteristic)
        .then(characteristic => {
            const writeValue = Uint8Array.of(4);
            return characteristic.writeValueWithoutResponse(writeValue);
        })
        .then(_ => {
            console.log('Right');
        })
        .catch(error => { console.log(error); });
    }



    return (
        <>
            <h3>Robot BLE</h3>
            <button onClick={BTConnect}> Connect 🔹</button>
            <button onClick={BTUpUp}> ⏫</button>
            <button onClick={BTUp}> ⬆️</button>
            <button onClick={BTStop}> 🛑</button>
            <button onClick={BTDown}> ⬇️</button>
            <button onClick={BTDownDown}> ⏬</button>
            <button onClick={BTLeft}> ⬅️</button>
            <button onClick={BTRight}> ➡️</button>

        </>
    );
}