import { db, auth } from '@/lib/firebase';

import { useRouter } from 'next/router';
import { doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';

export default function PostCreation({ date }) {
    // get user firebase id
    const uid = auth.currentUser.uid;

    // get username from url
    const router = useRouter();
    const { username } = router.query;
    // console.log(username);

    // check if posts exist for user
    const postRef = doc(db,"users",`${uid}`,'posts',`${date}`);


    // Create a new post in firestore
    const createPost = async (date, uid) => {

        const postRef = doc(db,"users",`${uid}`,'posts',`${date}`);

        // default values for post data
        const data = {
        uid,
        username,
        content: '# Let us know what you think 🤔',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        };

        await setDoc(postRef,data);
    }

    async function get_post(postRef, date, uid) {
        // get post document
        const postSnap =  await getDoc(postRef);
        
        // if it doesn't exist create a new post
        if (!postSnap.exists()) {
            createPost(date, uid);
        }
    }

    // Check if post already exist for the day
    get_post(postRef, date, uid);
    
}

