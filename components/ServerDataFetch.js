import { db, auth } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ServerDataFetch() {

    async function fetchServerData() {
        const serverIPRef = doc(db, "serverIP", "server");
        try {
        const serverIPSnap = await getDoc(serverIPRef);
    
        if (serverIPSnap.exists()) {
            console.log("Document data:", serverIPSnap.data());
            const serverData = serverIPSnap.data();
            const serverIP = serverData["ip"];
            const WebRTCPort = serverData["webrtcPort"];
            
            // Return an object with the retrieved values
            return { serverIP, WebRTCPort };
        } else {
            console.log("No such document serverIP!");
            return null; // Or handle the absence of data accordingly
        }
        } catch (error) {
        console.error("Error fetching serverIP document:", error);
        throw error; // Rethrow the error to let the calling code handle it
        }
    }

    // get user firebase id
    const uid = auth.currentUser.uid;
    
    fetchServerData()
    .then((result) => {
        if (result) {
        const { serverIP, WebRTCPort } = result;
        setSrcURL(`http://${serverIP}:${WebRTCPort}/mystream/`)

        } else {
        // Handle the case when no data is available
        console.log("No data available in serverIP in firebase.");
        }
    })
    .catch((error) => {
        // Handle errors from the fetchData function
        console.error("Error in fetchServerData:", error);
    });

}