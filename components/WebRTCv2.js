import { db, auth } from '@/lib/firebase';
import { servers } from '@/lib/servers';

import { collection, doc, onSnapshot, setDoc, getDoc, updateDoc, query, serverTimestamp, addDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from "react";

export default function WebRTC() {

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
        </>
    )
}
