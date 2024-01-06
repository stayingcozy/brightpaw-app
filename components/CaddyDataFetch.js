import { useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";


export default function CaddyDataFetch({ setHttpsSrcURL }) {

    // get caddy server IP
    var serverIP = ""
    async function fetchCaddyServer() {
        const docRef = doc(db, "caddyServers", "server0");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            var docData = docSnap.data();
            serverIP = docData["ip"];
        }
        else {
            console.log("No caddyServers document");
            serverIP = "" // "45.33.96.171"
        }
    }
    fetchCaddyServer()


    useEffect(() => {
        async function fetchServerData() {

        const uid = auth.currentUser.uid;
        const q = query(collection(db, "mediaServers"), where("uid", "==", uid));

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const serverData = doc.data();
            // httpsPort
            const httpsPort = serverData["httpsPort"];
            // subdir
            const subDir = serverData["subDir"];

            // Set the value using the provided setter function
            //setHttpsSrcURL(`http://${serverIP}`); // works for landing page for caddy with original caddyfile config
            setHttpsSrcURL(`https://${serverIP}.nip.io/${subDir}`); 
        });

        }

        fetchServerData();
    }, [setHttpsSrcURL]);

    return <div></div>;
}
