import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { db, auth } from '@/lib/firebase';
import { collection, doc, onSnapshot, getDoc} from 'firebase/firestore';

function QRCodeGenerator() {
  const [qrCodeDataUrl, setQRCodeDataUrl] = useState(null);
  
  const [formValue, setFormValue] = useState('');
  const [passValue, setPassValue] = useState('');
  const [wifiListenCount, setWifiListenCount] = useState(0);
  const [wifiStatus, setWifiStatus] = useState(0);

  const qrCodeSize = 500;
  const errorCorrectionLevel = 'H'; // Higher error correction level



  // get user firebase id
  const uid = auth.currentUser.uid;

  // Listen 
  const unsub = onSnapshot(doc(db,'users',`${uid}`), (doc) => {
    var data = doc.data();
    if (wifiStatus != data.wifiStatus) {
      setWifiStatus(data.wifiStatus);
      setWifiListenCount(wifiListenCount+1);
      console.log("Wifi Status Data Set", wifiListenCount, wifiStatus);
    }
    console.log("Current data: ", data.wifiStatus);
  });

  const generateQRCode = () => {
    const message = formValue+" ; "+passValue+" ; "+uid;
    if (message) {
      QRCode.toDataURL(message, { errorCorrectionLevel, width: qrCodeSize }, (err, dataUrl) => {
        if (err) {
          console.error(err);
        } else {
          setQRCodeDataUrl(dataUrl);
        }
      });
    }
  };

  const handleChange = (e) => {
    setFormValue(e.target.value);
  };
  const handlePassChange = (e) => {
    setPassValue(e.target.value);
  };

  return (
    <div>
      <h3>Setup Pet Camera to Local WIFI</h3>
      <div>
        <h2>1. Generate QR Code with WIFI Username (SSID) and Password</h2>
              <input name='messageInput' placeholder="Enter WIFI Name" value={formValue} onChange={handleChange}/>
              <input name='messagePassInput' placeholder="Enter Password" value={passValue} onChange={handlePassChange}/>
              <button onClick={generateQRCode}>Generate QR Code</button>
              </div>
              {wifiListenCount>1 && <strong>✅ Device Connected to Wifi</strong>}
        {qrCodeDataUrl && (
          <div>
            <img 
              src={qrCodeDataUrl} 
              alt="QR Code"
              style={{ width: qrCodeSize, height: qrCodeSize }} />
          </div>
        )}
    </div>
  );
}

export default QRCodeGenerator;
