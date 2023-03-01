import '@/styles/globals.css'
import { Toaster } from 'react-hot-toast';

import Navbar from '@/components/Navbar';
import { UserContext } from '@/lib/context';
import { useUserData } from '@/lib/hooks';

export default function App({ Component, pageProps }) {
  
  const userData = useUserData();

  return (
    <>
    <UserContext.Provider value={userData}>
      <Navbar />
      <Component {...pageProps}></Component>
      <Toaster />
    </UserContext.Provider>
    </>
  );
}
