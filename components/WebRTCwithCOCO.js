import { db, auth } from '@/lib/firebase';
import { servers } from '@/lib/servers';

import { collection, doc, onSnapshot, setDoc, getDoc, updateDoc, query, serverTimestamp, addDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from "react";

import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import {drawRect} from '@/lib/utilities'
import { classFilter, scoreFilter, centerpoint, RollingAverage, velocity } from '@/lib/analytics';

export default function WebRTCwithCOCO({
    playing, setPlaying, past_pred, uploadInterval,
    dogroll, catroll, personroll, predictionsMade,
    net, setNet, dogCount, catCount, personCount}) {

    // get user firebase id
    const uid = auth.currentUser.uid;

    // const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const callInputRef = useRef(null);
    const [videoWidth, setVideoWidth] = useState(0);
    const canvasRef = useRef(null);
    const DETECT_INTERVAL = 5; // milli-seconds 
    const [busy, setBusy] = useState(false);

    // Global State
    // const pc = new RTCPeerConnection(servers);
    const pcRef = useRef(null); // Reference to the RTCPeerConnection

    // const activityRef = db.collection('users').doc(uid).collection('activity');
    const activityRef = collection(db,'users',`${uid}`,'activity');
    
    var pred_len;
    var num_total_pred=0;
    var num_dog_pred=0;

    // On startup
    useEffect( () => {
        webcam_init();
    },[]);

    // 1. Setup media sources

    async function webcam_init() {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true }); // video:true, audio: true
        // video must be true for pi to accept call (appears as of now)
        const remoteStream = new MediaStream();

        // Push tracks from local stream to peer connection
        localStream.getTracks().forEach((track) => {
            getOrCreatePeerConnection().addTrack(track, localStream);
        });

        // Pull tracks from remote stream, add to video stream
        getOrCreatePeerConnection().ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
            console.log(remoteStream);
            });
        };

        // localVideoRef.current.srcObject = localStream;
        remoteVideoRef.current.srcObject = remoteStream;
        setVideoWidth(remoteVideoRef.current.videoWidth); // set the video width

    };

    // Get or create the RTCPeerConnection instance
    function getOrCreatePeerConnection() {
        if (!pcRef.current) {
            pcRef.current = new RTCPeerConnection(servers);
        }
        return pcRef.current;
    }

    // 2. Create an offer
    async function call() {
        // Reference Firestore collections for signaling
        // const callDoc = doc(collection(db,'calls'));
        const callDoc = doc(collection(db,'users',`${uid}`,'calls'));
        const offerCandidates = doc(collection(callDoc,'offerCandidates')); 
        const uidDoc = doc(db,'users',`${uid}`) // for latestCall

        const callUID = {
            latestCall: callDoc.id
        }
        await updateDoc(uidDoc, callUID) // add latest call for go server to answer

        // Get candidates for caller, save to db
        getOrCreatePeerConnection().onicecandidate = (event) => {
            // console.log("OnIceCandidate Triggered")
            // event.candidate && console.log(event.candidate.toJSON())
            event.candidate && setDoc(offerCandidates, event.candidate.toJSON() );
        };

        // Create offer
        const offerDescription = await getOrCreatePeerConnection().createOffer();
        await getOrCreatePeerConnection().setLocalDescription(offerDescription);
        // console.log("Offer has been created and set local description")

        const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
        };

        await setDoc(callDoc,{ offer })

        // console.log("Offer has been logged to fb")

        // Listen for remote answer
        onSnapshot(callDoc, (snapshot) => {
            const data = snapshot.data();
            if (!getOrCreatePeerConnection().currentRemoteDescription && data?.answer) {
                const answerDescription = new RTCSessionDescription(data.answer);
                console.log("answer is ..");
                console.log(answerDescription);
                getOrCreatePeerConnection().setRemoteDescription(answerDescription);
                console.log("Answer has been received and set to remote description")
                // answerReceived = true;
            }
        });

        // When answered, add candidate to peer connection
        const answerQueries = query(collection(callDoc,'answerCandidates'));
        onSnapshot(answerQueries, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') { // && answerReceived
                const candidate = new RTCIceCandidate(change.doc.data());
                console.log("added document triggered on snapshot... candidate...")
                console.log(candidate);
                console.log("pcref.current ...");
                console.log(pcRef.current);

                console.log("about to run add ICE")
                getOrCreatePeerConnection().addIceCandidate(candidate);
                // pcRef.current.addIceCandidate(candidate);
                console.log("ran add ICE")
                // console.log("Answer Candidate has been noticed and added as Ice Candidate")
            }
            });
        });

    };

    /// TF ///

    async function loadCOCO() {
        const coco = await cocossd.load();
        console.log("actual coco model:",coco);
        setNet(coco);
        
    }
    function loadWhenReady() {
        tf.ready().then(()=>{
            loadCOCO();
        })
    }
    // // Load model on start
    // useEffect( () => {
    //     tf.ready().then(()=>{
    //         loadCOCO();
    //         console.log("COCO loaded")
    //     })
    // },[])

    useEffect(() => {
        // This code will run after every render
        console.log('net value has been updated:', net);
        // runDetect()
        // setPlaying(true);
    }, [net]); // Only re-run the effect if net changes

    // Apply ML model when video is playing
    async function runDetect() {
        setPlaying(true);
    }
    useEffect( () => {
        async function detect(vid,ctx) {
            // console.log("detect has been called:",!busy,playing,vid.readyState)
            // console.log("and net..", net)

            if (!busy && playing && vid.readyState) {

                setBusy(() => true);
                // Make Detections
                const predictions = await net.detect(vid);
                // console.log("predicitions:",predictions.length)

                // Analytics
                var spred = scoreFilter(predictions)
                var cspred = classFilter(spred)

                if (cspred.length > 0) {
                    var pred_center = centerpoint(cspred);
                    // console.log('Predictions with center values:', pred_center);
            
                    if (past_pred.length > 0) {
                        var distanceDifferences = velocity(past_pred, pred_center);
                        
                        for (var i=0; i<distanceDifferences.length; i++) {
                            var distDiff = distanceDifferences[i];
                
                            switch (distDiff.class) {
                                case 'dog':
                                    dogroll.addValue(distDiff.difference)
                                    dogCount++;
                                    break;
                                case 'cat':
                                    catroll.addValue(distDiff.difference)
                                    catCount++;
                                    break;
                                case 'person':
                                    personroll.addValue(distDiff.difference)
                                    personCount++;
                                    break;
                                // case 'dining table': // only for testing
                                // dogroll.addValue(distDiff.difference)
                                // break;
                                default:
                                console.log('no class of interest found, only:',distDiff.class)
                                break;
                            }
                        }

                        if (dogCount<1) {
                            dogroll.addValue(0);
                        }
                        if (catCount<1) {
                            catroll.addValue(0);
                        } 
                        if(personCount<1) {
                            personroll.addValue(0);
                        }
                        dogCount = 0;
                        catCount = 0;
                        personCount = 0;
            
                        // console.log("Rolling avg. of dog activity:", dogroll.getAverage());
                        // console.log("Rolling avg. of cat activity:", catroll.getAverage());
                        // console.log("Rolling avg. of person activity:", personroll.getAverage());
            
                    }

                    past_pred = pred_center;

                    predictionsMade++; 
                    console.log(predictionsMade)
            
                    if (predictionsMade >= uploadInterval) {
            
                        console.log("About to update firebase...")
            
                        // upload to firebase
                        // const activityData = {
                        //     dog: isNaN(dogroll.getAverage()) ? 0: dogroll.getAverage(),
                        //     cat: isNaN(catroll.getAverage()) ? 0: catroll.getAverage(),
                        //     person: isNaN(personroll.getAverage()) ? 0: personroll.getAverage(),
                        //     timestamp: serverTimestamp(),
                        // };
                        const activityData = {
                            dog: dogroll.getAverage(),
                            cat: catroll.getAverage(),
                            person: personroll.getAverage(),
                            timestamp: serverTimestamp(),
                        };
            
                        // activityRef.add(activityData)
                        // .then((docRef) => {
                        //     console.log('Activity data uploaded successfully:', docRef.id);
                        // })
                        // .catch((error) => {
                        //     console.error('Error uploading activity data:', error);
                        // });
                        addDoc(activityRef, activityData)
            
                        predictionsMade = 0;
                    }
                }

                ///// Old Analytics
                // pred_len = predictions.length;
                // for (let i=0;i<pred_len;i++) {
                //     // console.log('Predictions: ',predictions[i]);
                //     if (predictions[i].class == "dog" && predictions[i].score > 0.50) {
                //         console.log('Predictions: ',predictions[i].class, "| Confidence: ", predictions[i].score);
                //         num_dog_pred++;
                //     }
                //     num_total_pred++;
                // }

                // setDogInView(num_dog_pred/num_total_pred)
                ////// End

                //clear pre-existing stroke
                // ctx.clearRect(0, 0, canvas.width, canvas.height);

                // draws video image onto canvas
                ctx.drawImage(vid,0,0,videoWidth,heightScaled);

                // Update drawing utility
                drawRect(predictions, ctx, xratio);

                setBusy(() => false);
            }
        }

        // Convert original resolution of video to canvas resolution
        const xratio = (videoWidth / remoteVideoRef.current.videoWidth);
        const heightScaled  = (xratio*remoteVideoRef.current.videoHeight);

        const vid = remoteVideoRef.current;
        const canvas = canvasRef.current;
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = heightScaled;

        // Draw mesh
        const ctx = canvas.getContext("2d");
        // draws video image onto canvas
        ctx.drawImage(vid,0,0,videoWidth,heightScaled);

        //  Loop detection
        const interval = setInterval(() => {
            detect(vid,ctx);
        }, DETECT_INTERVAL);

        return () => clearInterval(interval); // on unmount clear interval
    }, [playing] ); // dependent on state playing


    return (
        <>
            <div>
                <canvas
                    ref={canvasRef}
                    width={videoWidth} />
            </div>

            <div>
               {/* <h3> Remote Stream </h3> */}
               <video 
                    ref={remoteVideoRef}
                    autoPlay
                />
            </div>

            <button onClick={call}> Connect 🎥  </button>
            <button onClick={loadWhenReady}> Load COCO 🍪 </button>
            <button onClick={runDetect}> Start ML 🤖 </button>
        </>
    )
}
