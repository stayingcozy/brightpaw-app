import { useState } from 'react';
import { ref as vidRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'

import { auth, storage } from '@/lib/firebase';
import Loader from './Loader';
// import VideoPlayer from './VideoPlayer';

// Uploads images to Firebase Storage
export default function VideoUploader() {
  const [uploading, setUploading] = useState(false); // true if file is being uploaded to the cloud
  const [progress, setProgress] = useState(0); // progress of the upload %
  const [downloadURL, setDownloadURL] = useState(null); // download link avail when complete

  // Creates a Firebase Upload Task
  const uploadFile = async (e) => {

    console.log("uploadFile called.")

    // Get the file
    const file = Array.from(e.target.files)[0];
    const extension = file.type.split('/')[1];

    // meta data
    const metadata = {
      contentType: `video/${extension}`
    };

    // Makes reference to the storage bucket location
    // const ref = storage.ref(`uploads/${auth.currentUser.uid}/${Date.now()}.${extension}`); // v8
    const storageRef = vidRef(storage,`uploads/${auth.currentUser.uid}/${Date.now()}.${extension}`);
    setUploading(true); 

    console.log("reference made.")
    
    // Starts the upload
    // const task = ref.put(file); // v8
    const uploadTask  = uploadBytesResumable(storageRef,file,metadata);

    // Listen to updates to upload task
    uploadTask.on('state_changed', (snapshot) => {
      console.log(snapshot);
      const pct = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
      console.log({pct})
      setProgress(pct);

      // Get downloadURL AFTER task resolves - by using then (Note: this is not a native Promise) 
      // uploadTask
      //   .then((d) => storageRef.getDownloadURL())
      //   .then((url) => {
      //     setDownloadURL(url);
      //     setUploading(false);
      //   });
      uploadTask
      .then((d) => getDownloadURL(storageRef))
      .then((url) => {
        setDownloadURL(url);
        setUploading(false);
      });
    });
    };

    // // Listen for state changes, errors, and completion of the upload.
    // uploadTask.on('state_changed',
    // (snapshot) => {
    //   // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    //   const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    //   setProgress(pct)
    //   console.log('Upload is ' + pct + '% done');
    //   switch (snapshot.state) {
    //     case 'paused':
    //       console.log('Upload is paused');
    //       break;
    //     case 'running':
    //       console.log('Upload is running');
    //       break;
    //   }
    // }, 
    // (error) => {
    //   // A full list of error codes is available at
    //   // https://firebase.google.com/docs/storage/web/handle-errors
    //   switch (error.code) {
    //     case 'storage/unauthorized':
    //       // User doesn't have permission to access the object
    //       break;
    //     case 'storage/canceled':
    //       // User canceled the upload
    //       break;

    //     // ...

    //     case 'storage/unknown':
    //       // Unknown error occurred, inspect error.serverResponse
    //       break;
    //   }
    // }, 
    // () => {
    //   // Upload completed successfully, now we can get the download URL
    //   getDownloadURL(uploadTask.snapshot.vidRef).then((downloadURL) => {
    //     console.log('File available at', downloadURL);
    //     setDownloadURL(downloadURL);
    //     setUploading(false);
    //   });
    // }
    // );
  // };

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
    {/* {downloadURL && <code className="upload-snippet">{`${downloadURL}`}</code>} */}
    </div>
  );
}