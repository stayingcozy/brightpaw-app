import { useState } from 'react';
import { ref as vidRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

import { auth, storage } from '@/lib/firebase';
import Loader from './Loader';

// Uploads images to Firebase Storage
export default function VideoUploader({ downloadURL, setDownloadURL }) {

  const [uploading, setUploading] = useState(false); // true if file is being uploaded to the cloud
  const [progress, setProgress] = useState(0); // progress of the upload %

  // Creates a Firebase Upload Task
  const uploadFile = async (e) => {

    // Get the file
    const file = Array.from(e.target.files)[0];
    const extension = file.type.split('/')[1];

    // meta data
    const metadata = {
      contentType: `video/${extension}`
    };

    // Makes reference to the storage bucket location
    const storageRef = vidRef(storage,`uploads/${auth.currentUser.uid}/${Date.now()}.${extension}`);
    setUploading(true); 
    
    // Starts the upload
    const uploadTask  = uploadBytesResumable(storageRef,file,metadata);

    // // Listen to updates to upload task
    // uploadTask.on('state_changed', (snapshot) => {
    //   const pct = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
    //   setProgress(pct);

    //   // Get downloadURL AFTER task resolves - by using then (Note: this is not a native Promise) 
    //   uploadTask
    //   .then((d) => getDownloadURL(storageRef))
    //   .then((url) => {
    //     setDownloadURL(url);
    //     setUploading(false);
    //   });
    // });
    // };

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on('state_changed', (snapshot) => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      const pct = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
      setProgress(pct)
      switch (snapshot.state) {
        case 'paused':
          console.log('Upload is paused');
          break;
        case 'running':
          console.log('Upload is running');
          break;
      }
    }, 
    (error) => {
      // A full list of error codes is available at
      // https://firebase.google.com/docs/storage/web/handle-errors
      switch (error.code) {
        case 'storage/unauthorized':
          // User doesn't have permission to access the object
          break;
        case 'storage/canceled':
          // User canceled the upload
          break;

        // ...

        case 'storage/unknown':
          // Unknown error occurred, inspect error.serverResponse
          break;
      }
    }, 
    () => {
      // Upload completed successfully, now we can get the download URL
      getDownloadURL(storageRef).then((URL) => {
        console.log('File available at', URL);
        setDownloadURL(URL);
        setUploading(false);
      });
    }
    );
  };

  return (
    <div className="box">
        <Loader show={uploading} />
        {uploading && <h3>{progress}%</h3>}

        {!uploading && (
        <>
            <label className="btn">
            📹 Upload Video
            <input type="file" onChange={uploadFile} accept="video/mp4" />
            </label>
        </>
    )}
    </div>
  );
}