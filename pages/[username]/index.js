import { useState, useRef } from 'react';

import styles from '@/styles/Admin.module.css';
import VideoUploader from "@/components/VideoUploader";
import AuthCheck from '@/components/AuthCheck';
import PostCreation from '@/components/PostCreation';
import { db, auth } from '@/lib/firebase';
import getMonthDayYear from '@/lib/getMonthDayYear';
import SignOutButton from '@/components/SignOutButton';
// import WebCamTfCoco from '@/components/WebCamTfCoco';

import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form'; // keep track of form inputs, and if form is valid,invalid
import ReactMarkdown from 'react-markdown'; // markdown notation for post
import toast from 'react-hot-toast';
import UploadTfCoco from '@/components/UploadTfCoco';
// import WebRTC from '@/components/WebRTC';
// import RemoteWebRTC from '@/components/RemoteWebRTC';
// import RemoteWebRTCTFCoco from '@/components/RemoteWebRTC_TFCoco'
// import WebRTCuser from '@/components/WebRTCuser';
import WebRTCpi from '@/components/WebRTCpi';
import ConnectBLE from '@/components/ConnectBLE';
// import UploadRoboflow from '@/components/UploadRoboflow';
//

export default function UserProfilePage(props) {

  // props to pass to video component children
  const [downloadURL, setDownloadURL] = useState(null); // download link avail when complete

  // get date
  const todaysDate = getMonthDayYear();

  return (
    <main>
        <AuthCheck>
          <ConnectBLE />

          <WebRTCpi />
          {/* <RemoteWebRTCTFCoco /> */}
          <VideoUploader setDownloadURL={setDownloadURL} />
          <UploadTfCoco downloadURL={downloadURL} />
          {/* <UploadRoboflow downloadURL={downloadURL} /> */}
          <PostCreation date={todaysDate} />
          <PostManager date={todaysDate} />   
        </AuthCheck>
        <SignOutButton />
    </main>
  )
}


function PostManager({ date }) {
  const [preview, setPreview] = useState(false);

  const uid = auth.currentUser.uid;

  // since the user was authenticated, we can just grab it
  const postRef = doc(db,'users',`${uid}`,'posts',`${date}`);

  const [post] = useDocumentData(postRef); // real time - listen to the host
  //const [post] = useDocumentDataOnce(postRef); // only need read once to post the form

  return (
  <main className={styles.container}>
      {post && (
      <>
          <section>
          <PostForm postRef={postRef} defaultValues={post} preview={preview} />
          </section>

          <aside>
          <h3>Tools</h3>
          <button onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button>
          </aside>
      </>
      )}
  </main>
  );
}

function PostForm({ defaultValues, postRef, preview }) {
  // isDirty means the user interacted with it
  const { register, handleSubmit, reset, watch, formState: {isValid, isDirty, errors} } = useForm({ defaultValues, mode: 'onChange' });

  const updatePost = async ({ content }) => {
  await updateDoc(postRef,{
      content,
      updatedAt: serverTimestamp(),
  });

  reset({ content });

  toast.success('Feedback Sent!')
  };

  // watch() the content and render in markdown

  return (
  <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
      <div className="card">
          <ReactMarkdown>{watch('content')}</ReactMarkdown> 
      </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>

      <textarea name="content" {...register("content",
              {maxLength: { value: 20000, message: 'content is too long' }},
              {minLength: { value: 10, message: 'content is too short' }},
              {required: { value: true, message: 'content is required'}}
          )}></textarea>
      {errors.content && <p className="text-danger">{errors.content.message}</p>}

      <button type="submit" className="btn-green" disabled={!isDirty || !isValid}>
          Save Changes
      </button>
      </div>
  </form>
  );
}