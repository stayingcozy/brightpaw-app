import { useRouter } from 'next/router'
import Link from 'next/link';
import { useContext } from 'react';
import { UserContext } from '@/lib/context';

// Component's children only shown to logged-in users
export default function URLCheck( props ) {
  const { username } = useContext(UserContext);
  const { asPath } = useRouter();

  var usernameCheck =  username==asPath.slice(1);
  var stripe_succ = "success" == asPath.slice(1);
  var stripe_fail = "failed" == asPath.slice(1);

  return (usernameCheck || stripe_fail || stripe_succ) ? props.children : props.fallback || <Link href="/enter">You must be signed in</Link>;
  // condition ? exprIfTrue : exprIfFalse
}