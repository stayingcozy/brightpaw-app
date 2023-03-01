import Link from 'next/link';
import { useContext } from 'react';
import { UserContext } from '@/lib/context';

// top navbar
export default function Navbar() {
    
    const {user,username} = useContext(UserContext)

    return (
        <nav className="navbar">
            <ul>
                {/* user is signed-in and has username */}
                {username && (
                 <>
                 <li>
                    <Link href={`/${username}`}>
                        <img src={user?.photoURL} />
                    </Link>
                 </li>
                 </>
                )}
                {/* user is not signed-in and has not created username */}
                {!username && (
                    <li>
                        <Link href="/enter">
                            <button className="btn-blue">Log in</button>
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    )
}