import { auth, db, googleAuthProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, writeBatch, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';

import { UserContext } from '@/lib/context';
import { useEffect, useState, useCallback, useContext } from 'react';
import debounce from 'lodash.debounce';

export default function Enter(props) {
  const {user, username} = useContext(UserContext);
  const router = useRouter();

  if (user && username) {
    router.push(username);
  }

  // 1. user signed out <SignInButton />
  // 2. user signed in, but missing username <UsernameForm />
  // 3. user signed in, has username <SignOutButton />
  return (
    <main>
      {user ? 
        !username ? <UsernameForm /> : <SignInPlaceHolder />
        : 
        <SignInButton username = {username} />
      }
    </main>
  );
}

// Sign in with Google button
function SignInButton({ username }) {
  // const router = useRouter();

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleAuthProvider);
    // router.push(`/${username}`);
  };

  return (
    <button className="btn-google" onClick={signInWithGoogle}>
      <img src={'/google.png'} /> Sign in with Google
    </button>
  );
}

function SignInPlaceHolder() {
 return <code className="upload-snippet">Click your profile pic above to get started.</code>
}

  // User form
function UsernameForm() {
  const [formValue, setFormValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  // const router = useRouter();

  const {user, username} = useContext(UserContext);

  const onSubmit = async (e) => {
      e.preventDefault(); // default - refresh the page

      // Create refs for both documents
      // const userDoc = firestore.doc(`users/${user.uid}`); // v8
      // const usernameDoc = firestore.doc(`usernames/${formValue}`); // v8
      const userDoc = doc(db,`users/${user.uid}`);
      const usernameDoc = doc(db,`usernames/${formValue}`); 

      // Commit both docs together as a batch write.
      // const batch = firestore.batch(); // v8
      const batch = writeBatch(db);
      batch.set(userDoc, { username: formValue, photoURL: user.photoURL, displayName: user.displayName, email: user.email });
      batch.set(usernameDoc, { uid: user.uid });

      await batch.commit();
      // router.push(`/${username}`);
  }

  const onChange = (e) => {
      // Force form value typed in form to match correct format
      const val = e.target.value.toLowerCase();
      // regex - format test
      const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

      // Only set form value if length is < 3 OR it passes regex
      if (val.length < 3) {
          // allow user to type into form
          setFormValue(val);
          // but say it is invalid because it is too short
          setLoading(false);
          setIsValid(false);
      }

      if (re.test(val)) {
          setFormValue(val);
          // start async checking in database
          setLoading(true);
          setIsValid(false);
      }
  };
  
  // List to the typing and execute a read to the database
  useEffect(() => {
      checkUsername(formValue);
      }, [formValue]);


  // Hit the database for username match after each debounced change
  // useCallback is required for debounce to work
  const checkUsername = useCallback(
      debounce(async (username) => {
          if (username.length>=3) {
              const ref = doc(db,"usernames",username);

              const docSnap = await getDoc(ref);
              const exists = docSnap.exists();
              console.log('Firestone read executed!');
              // if doc does not exist we know that is a valid username
              setIsValid(!exists);
              setLoading(false);
          }

      }, 500), // only loads after 500 miliseconds after past Change. ie wait for user to stop typing 
      [] // to work in react wrap with useCallback hook - allows memo-ized
  );


  return (
      !username && (
          <section>
              <h3> Choose Username</h3>
              <form onSubmit={onSubmit}>
                  <input name='username' placeholder="username" value={formValue} onChange={onChange} />

                  <UsernameMessage username={formValue} isValid={isValid} loading={loading} />

                  <button type="submit" className="btn-green" disabled={!isValid}>
                      Choose
                  </button>
                  
                  <h3>Debug State</h3>
                  <div>
                      Username: {formValue}
                      <br />
                      Loading: {loading.toString()}
                      <br />
                      Username Valid: {isValid.toString()}
                  </div>
              </form>
          </section>
      )

  );
}

function UsernameMessage({ username, isValid, loading }) {
  if (loading) {
    return <p>Checking...</p>;
  } else if (isValid) {
    return <p className="text-success">{username} is available!</p>;
  } else if (username && !isValid) {
    return <p className="text-danger">That username is taken!</p>;
  } else {
    return <p></p>;
  }
}