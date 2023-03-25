import { db } from '@/lib/firebase';
import { servers } from '@/lib/servers';
import { drawRect } from '@/lib/utilities';

import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import { collection, doc, onSnapshot, setDoc, getDoc, updateDoc, query } from 'firebase/firestore';
import { useRef, useState, useEffect } from 'react';


export default function RemoteWebRTCTFCoco() {

    //// WebRTC ////

    // Global State
    const pc = new RTCPeerConnection(servers);

    const remoteVideoRef = useRef(null);
    const callInputRef = useRef(null);

    let localStreamHeight = null;
    let localStreamWidth = null;

    // 1. Setup media sources

    async function webcam_init() {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const remoteStream = new MediaStream();

        // Get stats
        localStreamHeight = localStream.getVideoTracks()[0].getSettings().height
        localStreamWidth = localStream.getVideoTracks()[0].getSettings().width

        // Push tracks from local stream to peer connection
        localStream.getTracks().forEach((track) => {
            pc.addTrack(track, localStream);
        });

        // Pull tracks from remote stream, add to video stream
        pc.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
            });
        };

        remoteVideoRef.current.srcObject = remoteStream;

    };

    // 2. Create an offer
    async function call() {
        // Reference Firestore collections for signaling
        const callDoc = doc(collection(db,'calls'));
        const offerCandidates = doc(collection(callDoc,'offerCandidates')); 

        callInputRef.current.value = callDoc.id;

        // Get candidates for caller, save to db
        pc.onicecandidate = (event) => {
            event.candidate && setDoc(offerCandidates, event.candidate.toJSON() );
        };

        // Create offer
        const offerDescription = await pc.createOffer();
        await pc.setLocalDescription(offerDescription);

        const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
        };

        await setDoc(callDoc,{ offer })

        // Listen for remote answer
        onSnapshot(callDoc, (snapshot) => {
            const data = snapshot.data();
            if (!pc.currentRemoteDescription && data?.answer) {
            const answerDescription = new RTCSessionDescription(data.answer);
            pc.setRemoteDescription(answerDescription);
            }
        });

        // When answered, add candidate to peer connection
        const answerQueries = query(collection(callDoc,'answerCandidates'));
        onSnapshot(answerQueries, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const candidate = new RTCIceCandidate(change.doc.data());
                pc.addIceCandidate(candidate);
            }
            });
        });

    };

    // 3. Answer the call with the unique ID
    async function answer() {
        const callId = callInputRef.current.value;

        const callDoc = doc(collection(db,'calls'), callId);
        const answerCandidates = doc(collection(callDoc,'answerCandidates'));

        pc.onicecandidate = (event) => {
            event.candidate && setDoc(answerCandidates,event.candidate.toJSON());
        };

        const callSnap = (await getDoc(callDoc));
        const callData = callSnap.data();

        const offerDescription = callData.offer;
        await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

        const answerDescription = await pc.createAnswer();
        await pc.setLocalDescription(answerDescription);

        const answer = {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
        };

        await updateDoc(callDoc,{ answer });

        const offerQueries = query(collection(callDoc,'offerCandidates'));
        onSnapshot(offerQueries,(snapshot) => {
            snapshot.docChanges().forEach((change) => {
            console.log(change);
            if (change.type === 'added') {
                let data = change.doc.data();
                pc.addIceCandidate(new RTCIceCandidate(data));
            }
            });
        });

        // Video stream on, ref for ML
        setPlaying(true);
    };

    async function hangup() {
        console.log("Need to implement hangup");
    }

    //// OBJ DET w/ TENSORFLOW.js + CocoSSD ////

    const canvasRef = useRef(null);
    const [busy, setBusy] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [net, setNet] = useState();

    const DETECT_INTERVAL = 1000; // milli-seconds 
    
    async function loadCOCO() {
        const coco = await cocossd.load();
        setNet(coco);
    }
    // Load model on start
    useEffect( () => {
        tf.ready().then(()=>{
          loadCOCO();
        })
    },[])

    // Apply ML model when video is playing
    useEffect( () => {
    async function detect(vid,ctx) {
        if (!busy && playing && vid.readyState) {

        setBusy(() => true);
        // Make Detections
        const predictions = await net.detect(vid);
        console.log('Predictions: ',predictions);
        
        //clear pre-existing stroke
        // ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draws video image onto canvas
        ctx.drawImage(vid,0,0,localStreamWidth,heightScaled);

        // Update drawing utility
        drawRect(predictions, ctx, xratio);

        setBusy(() => false);
        }
    }
    
    // Convert original resolution of video to canvas resolution
    const xratio = (localStreamWidth / localStreamWidth);
    const heightScaled  = (xratio*localStreamHeight);

    const vid = remoteVideoRef.current;
    const canvas = canvasRef.current;
    canvasRef.current.width = localStreamWidth;
    canvasRef.current.height = heightScaled;

    // Draw mesh
    const ctx = canvas.getContext("2d");
    // draws video image onto canvas
    ctx.drawImage(vid,0,0,localStreamWidth,heightScaled);

    //  Loop detection
    const interval = setInterval(() => {
        detect(vid,ctx);
    }, DETECT_INTERVAL);

    return () => clearInterval(interval); // on unmount clear interval

    }, [playing] ); // dependent on state playing

    return (
        <>
            <div>
                <h3> Canvas </h3>
                <canvas
                    ref={canvasRef}
                    width={localStreamWidth} />
            </div>

            <div>
               <h3> Remote Stream </h3>
               <video 
                    ref={remoteVideoRef}
                    autoPlay
                />
            </div>

            <button onClick={webcam_init}>Start webcam</button>

            <h2>2. Create a new Call</h2>
            <button onClick={call}>Create Call (offer)</button>

            <h2>3. Join a Call</h2>
            <p>Answer the call from a different browser window or device</p>
            
            <input ref = {callInputRef} />
            <button onClick={answer}>Answer</button>

            <button onClick={hangup}>Hangup</button>

        </>
    )
}