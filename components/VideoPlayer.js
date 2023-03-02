import ReactPlayer from 'react-player/lazy'

export default function VideoPlayer({ downloadURL, setDownloadURL }) {
  return (
    <main>
      <ReactPlayer id="myvid"
                              url={downloadURL}
                              width='100%'
                              height='100%'
                              playing={true}
                              controls={true}
                              volume={1}
                              progressInterval={5000}
                              pip={true}
                          />
    </main>
  )
}