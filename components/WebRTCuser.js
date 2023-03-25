import { db, auth } from '@/lib/firebase';
import { servers } from '@/lib/servers';

import { collection, doc, onSnapshot, setDoc, getDoc, updateDoc, query } from 'firebase/firestore';
import { useRef } from 'react';

export default function WebRTCuser() {

    // get user firebase id
    const uid = auth.currentUser.uid;

    // Global State
    const pc = new RTCPeerConnection(servers);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const callInputRef = useRef(null);

    // 1. Setup media sources

    async function webcam_init() {
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const remoteStream = new MediaStream();

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

        localVideoRef.current.srcObject = localStream;
        remoteVideoRef.current.srcObject = remoteStream;

    };

    // 2. Create an offer
    async function call() {
        // Reference Firestore collections for signaling
        // const callDoc = doc(collection(db,'calls'));
        const callDoc = doc(collection(db,'users',`${uid}`,'calls'));
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

        // const callDoc = doc(collection(db,'calls'), callId);
        const callDoc = doc(collection(db,'users',`${uid}`,'calls'), callId);
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
    };

    async function hangup() {
        console.log("Need to implement hangup");
    }

    return (
        <>
            <div>
                <h3> Local Stream </h3>
                <video 
                    ref={localVideoRef}
                    autoPlay
                />
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