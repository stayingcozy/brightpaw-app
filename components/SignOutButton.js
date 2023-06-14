import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/router';

// Sign out button
export default function SignOutButton() {
    const router = useRouter();

    const signoutEnter = async (event) => {

        event.preventDefault();
        
        // route back to sign in page
        router.push('/enter');

        // signout
        signOut(auth);
    }

    return(
        <button onClick={signoutEnter}>Sign Out</button>
    )
}