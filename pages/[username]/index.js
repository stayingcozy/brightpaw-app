import VideoUploader from "@/components/VideoUploader";
import MyButton from "@/components/MyButton";
import VideoPlayer from "@/components/VideoPlayer";

export default function UserProfilePage() {
  return (
    <main>
        <VideoUploader />
        <VideoPlayer />
        <MyButton />
    </main>
  )
}