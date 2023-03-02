import { useState } from 'react';

import VideoUploader from "@/components/VideoUploader";
import MyButton from "@/components/MyButton";
import VideoPlayer from "@/components/VideoPlayer";

export default function UserProfilePage() {

  // props to pass to video component children
  const [downloadURL, setDownloadURL] = useState(null); // download link avail when complete

  return (
    <main>
        <VideoUploader downloadURL={downloadURL} setDownloadURL={setDownloadURL} />
        <VideoPlayer  downloadURL={downloadURL} setDownloadURL={setDownloadURL} />
    </main>
  )
}