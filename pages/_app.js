import '@/styles/globals.css'
import MyButton from '@/components/MyButton'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps}></Component>
      <MyButton />
      <MyButton />

    </>
  );
}
