import { db, auth } from '@/lib/firebase';

import { useRouter } from 'next/router';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
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
    const [postDoc] = useDocument(postRef);

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

        // await postRef.set(data); // send it to firebase v8
        await setDoc(postRef,data);
    }

    // if post for the day does not exist create a new post
    !postDoc?.exists && createPost(date, uid);
}

