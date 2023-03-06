import { useRef } from 'react';
import MyVideoPlayer from '@/components/MyVideoPlayer.js';

export default function VideoApp({ downloadURL }) {
  const ref = useRef(null);
  return (
    <>
        <button onClick={() => ref.current.play()}>
        Play
        </button>
        <button onClick={() => ref.current.pause()}>
        Pause
        </button>
        {downloadURL && 
            <MyVideoPlayer
                ref={ref}
                src = {downloadURL}
                type="video/mp4"
                width="500"
            />
        }
    </>
  );
}
