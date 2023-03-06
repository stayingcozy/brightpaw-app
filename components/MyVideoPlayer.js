import { forwardRef } from 'react';

const VideoPlayer = forwardRef(function VideoPlayer({ src, type, width }, ref) {
  return (
    <video width={width} ref={ref} id="movie">
      <source
        src={src}
        type={type}
      />
    </video>
  );
});

export default VideoPlayer;
