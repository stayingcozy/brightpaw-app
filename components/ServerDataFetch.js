import { useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs } from "firebase/firestore";


export default function ServerDataFetch({ setSrcURL }) {

  const WebRTCPort = 8889;

  useEffect(() => {
    async function fetchServerData() {

      const uid = auth.currentUser.uid;
      const q = query(collection(db, "mediaServers"), where("uid", "==", uid));

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());
        const serverData = doc.data();
        const serverIP = serverData["ip"];

        // Set the value using the provided setter function
        setSrcURL(`http://${serverIP}:${WebRTCPort}/${uid}/`);
      });


      /// Past with serverIP - made for only one media server ///
      // const serverIPRef = doc(db, "serverIP", "server");
      // try {
      //   const serverIPSnap = await getDoc(serverIPRef);

      //   if (serverIPSnap.exists()) {
      //     console.log("Document data:", serverIPSnap.data());
      //     const serverData = serverIPSnap.data();
      //     const serverIP = serverData["ip"];

      //     // Set the value using the provided setter function
      //     setSrcURL(`http://${serverIP}:${WebRTCPort}/mystream/`);
      //   } else {
      //     console.log("No such document serverIP!");
      //     // Handle the absence of data accordingly
      //   }

      // } catch (error) {
      //   console.error("Error fetching serverIP document:", error);
      //   // Rethrow the error to let the calling code handle it
      //   throw error;
      // }

    }

    fetchServerData();
  }, [setSrcURL]);

  return <div></div>;
}
