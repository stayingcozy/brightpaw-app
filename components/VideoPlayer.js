import ReactPlayer from 'react-player/lazy'

export default function VideoPlayer(downloadURL) {
  return (
    <main>
        <ReactPlayer url={downloadURL} />
    </main>
  )
}