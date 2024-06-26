import Link from 'next/link';
import { useContext } from 'react';
import { UserContext } from '@/lib/context';

// top navbar
export default function Navbar(context) {
    
    const {user,username} = useContext(UserContext)

    return (
        <nav className="navbar">
            <ul>
                {/* user is signed-in and has username */}
                {username && (
                 <>
                    <li>
                        <Link 
                        href={`/${username}/checkout`}>
                            <span aria-label="emoji" role="img">
                            🛒
                            </span>{' '}
                            Shop
                        </Link> 
                    </li>
                    {/* <li>
                        <Link href={`/${username}/payments`}>
                            <span aria-label="emoji" role="img">
                            💸
                            </span>{' '}
                            Payments
                        </Link>
                    </li> */}
                    {/* <li>
                        <Link href={`/${username}/customers`}>
                            <span aria-label="emoji" role="img">
                            🧑🏿‍🤝‍🧑🏻
                            </span>{' '}
                            Customers
                        </Link>
                    </li> */}
                    <li>
                        <Link href={`/${username}/subscriptions`}>
                            <span aria-label="emoji" role="img">
                            🔄
                            </span>{' '}
                            Subscriptions
                        </Link>
                    </li>
                    <li>
                        <Link href={`/${username}/settings`}>
                            <span aria-label="emoji" role="img">
                            ⚙️
                            </span>{' '}
                            Settings
                        </Link>
                    </li>
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