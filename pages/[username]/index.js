import { useState } from 'react';

import VideoUploader from "@/components/VideoUploader";
import VideoPlayer from "@/components/VideoPlayer";
import AuthCheck from '@/components/AuthCheck';

export default function UserProfilePage(props) {

  // props to pass to video component children
  const [downloadURL, setDownloadURL] = useState(null); // download link avail when complete

  return (
    <main>
        <AuthCheck>
          <VideoUploader downloadURL={downloadURL} setDownloadURL={setDownloadURL} />
          <VideoPlayer  downloadURL={downloadURL} setDownloadURL={setDownloadURL} />
        </AuthCheck>
    </main>
  )
}