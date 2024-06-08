// import firebase from 'firebase/app' // v8
import { getApps, initializeApp } from 'firebase/app';
// import 'firebase/auth'; // v8
import { getAuth, GoogleAuthProvider } from "firebase/auth"
// import 'firebase/firestore'; // v8
// import { getFirestore, collection, fromMillis, serverTimestamp, increment } from 'firebase/firestore';
import { getFirestore, collection } from 'firebase/firestore';
// import 'firebase/storage'; // v8
// import { getStorage, STATE_CHANGED } from 'firebase/storage';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = { YOUR_FIREBASE_CONFIG
};

// if (!firebase.apps.length) {
//     firebase.initializeApp(firebaseConfig)
// }

if (!getApps.length) {
  const app = initializeApp(firebaseConfig);
} 



// export const auth = firebase.auth(); // v8
export const auth = getAuth();
// export const googleAuthProvider = new firebase.auth.GoogleAuthProvider(); //v8
export const googleAuthProvider = new GoogleAuthProvider();

// export const firestore = firebase.firestore(); //v8
export const db = getFirestore();
// export const fromMillis = firebase.firestore.Timestamp.fromMillis; // v8
// export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp; // v9
// export const increment = firebase.firestore.FieldValue.increment; //v8

// Storage exports
// export const storage = firebase.storage(); // v8
export const storage = getStorage();
// export const STATE_CHANGED = firebase.storage.TaskEvent.STATE_CHANGED; //v8

/// Helper functions
/**`
 * Gets a users/{uid} document with username
 * @param {string} username
 */
export async function getUserWithUsername(username) {

  // gets user collection
  // const usersRef = firestore.collection('users'); // v8
  const usersRef = collection('users');
  // query to get user name of username input
  const query = usersRef.where('username','==', username).limit(1);
  // make query - get first doc
  const userDoc = (await query.get()).docs[0];
  return userDoc;
}

/**`
 * Converts a firestore document to JSON
 * @param  {DocumentSnapshot} doc
 */
export function postToJSON(doc) {
  const data = doc.data();
  return {
    ...data,
    // Gotcha! firestore timestamp NOT serializable to JSON. Must convert to milliseconds
    createdAt: data?.createdAt.toMillis() || 0,
    updatedAt: data?.updatedAt.toMillis() || 0,
  };
}