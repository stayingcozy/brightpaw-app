import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/router';

// Sign out button
export default function SignOutButton() {
    const router = useRouter();

    function signoutEnter() {
        // signout
        signOut(auth);
        // route back to sign in page
        router.push('/enter');
    }

    return(
        <button onClick={signoutEnter}>Sign Out</button>

    )
}