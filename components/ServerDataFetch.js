import { useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ServerDataFetch({ setSrcURL }) {

  useEffect(() => {
    async function fetchServerData() {
      const serverIPRef = doc(db, "serverIP", "server");
      try {
        const serverIPSnap = await getDoc(serverIPRef);

        // if (serverIPSnap.exists()) {
        //   console.log("Document data:", serverIPSnap.data());
        //   const serverData = serverIPSnap.data();
        //   const serverIP = serverData["ip"];
        //   const WebRTCPort = serverData["webrtcPort"];

        //   // Set the value using the provided setter function
        //   setSrcURL(`http://${serverIP}:${WebRTCPort}/mystream/`);
        // } else {
        //   console.log("No such document serverIP!");
        //   // Handle the absence of data accordingly
        // }
      } catch (error) {
        console.error("Error fetching serverIP document:", error);
        // Rethrow the error to let the calling code handle it
        throw error;
      }
    }

    fetchServerData();
  }, [setSrcURL]);

  return <div></div>;
}
