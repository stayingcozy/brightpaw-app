import { useState, useEffect, useRef } from 'react';

import styles from '@/styles/Admin.module.css';
import VideoUploader from "@/components/VideoUploader";
import AuthCheck from '@/components/AuthCheck';
import PostCreation from '@/components/PostCreation';
import { db, auth } from '@/lib/firebase';
import getMonthDayYear from '@/lib/getMonthDayYear';
import SignOutButton from '@/components/SignOutButton';
// import WebCamTfCoco from '@/components/WebCamTfCoco';

import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
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
import joystick from '@/components/Joystick';
import { Joystick } from 'react-joystick-component';
// import UploadRoboflow from '@/components/UploadRoboflow';
import IntervalMetric from '@/components/IntervalMetric';
import URLCheck from '@/components/UrlCheck';
// import { StripePub } from '@/components/StripePub';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ActivityChart } from '@/components/ActivityChart';
import WebRTCwithCOCO from '@/components/WebRTCwithCOCO';
import { RollingAverage } from '@/lib/analytics';
import { AreaActivityChart } from '@/components/AreaActivityChart';
import { AreaAllActivityChart } from '@/components/AreaAllActivityChart';
// import ConnectBLE_Camera from '@/components/ConnectBLE_Camera'
import WebRTC from '@/components/WebRTCv2';
import ServerDataFetch from '@/components/ServerDataFetch';
import ActivityRechart from '@/components/ActivityRechart';
import { DailyActivityChart } from '@/components/DailyActivityChart';
import CaddyDataFetch from '@/components/CaddyDataFetch';
//

export default function UserProfilePage(props) {

  // props to pass to video component children
  const [downloadURL, setDownloadURL] = useState(null); // download link avail when complete
  const [playing, setPlaying] = useState(false); // if upload video is playing
  const [dogInView, setDogInView] = useState(0); // if upload video is playing

  // get date
  const todaysDate = getMonthDayYear();

  // get stripe public key
  const stripePromise = loadStripe(
    'pk_test_51NBRQVIdyxz3uazIYnk5wpqkkj2S8PGvR3kFNnGO5fSqgBd1W6irb4pcdcTVzoCfkC8pexeOeVC9AbEun9Kcaxql00cX3NgyTD'
  );

  // Stream View Values
  // var viewUser = "usertest";
  // var viewPass = "passtest";
  // var serverIP = "192.168.86.26";
  // const WebRTCPort = "8889";
  //var srcURL = `http://${viewUser}:${viewPass}@${serverIP}:${WebRTCPort}/mystream`
  // var srcURL = `http://${serverIP}:${WebRTCPort}/mystream/`

  const [srcURL, setSrcURL] = useState('');
  const [httpsSrcURL, setHttpsSrcURL] = useState('');


  return (
    <main>
        <AuthCheck>
          {/* <URLCheck> */}
            <Elements stripe={stripePromise}>

              {/* <ConnectBLE /> */}
              {/* <Joystick /> */}

              {/* <ConnectBLE_Camera /> */}
              
              {/* <WebRTCpi setPlaying={setPlaying}/> */}
              {/* <WebRTCwithCOCO 
                playing={playing} setPlaying={setPlaying}  
                past_pred={past_pred} uploadInterval={uploadInterval}
                dogroll={dogroll} catroll={catroll} personroll={personroll}
                predictionsMade={predictionsMade}
                net={net} setNet={setNet}
                dogCount={dogCount} catCount={catCount} personCount={personCount}
              /> */}
              {/* <iframe src="http://localhost:8889/mystream/" scrolling="no"></iframe> */}
              {/* <iframe src="http://localhost:8889/mystream/" width="100%" height="100%" scrolling="no"></iframe> */}
              <ServerDataFetch setSrcURL={setSrcURL} />
              <div className="videoWrapper">
                <iframe width="1280" height="720" src={srcURL} allowFullScreen></iframe>
              </div>
              <CaddyDataFetch setHttpsSrcURL={setHttpsSrcURL} />
              <div className="videoWrapper">
                <iframe width="1280" height="720" src={httpsSrcURL} allowFullScreen></iframe>
              </div>

              {/* <WebRTC /> */}

              {/* <RemoteWebRTCTFCoco /> */}
              {/* <VideoUploader setDownloadURL={setDownloadURL} />
              <UploadTfCoco downloadURL={downloadURL} playing={playing} setPlaying={setPlaying} setDogInView={setDogInView} /> */}

              {/* <ActivityChart /> */}
              {/* <AreaActivityChart /> */}
              {/* <AreaAllActivityChart /> */}
              <DailyActivityChart />
              {/* <ActivityRechart /> */}

              {/* <UploadRoboflow downloadURL={downloadURL} /> */}
              {/* <IntervalMetric playing={playing} dogInView={dogInView} /> */}
              <PostCreation date={todaysDate} />
              <PostManager date={todaysDate} />  
            </Elements>
          {/* </URLCheck> */}

          <SignOutButton />
        </AuthCheck>
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