import React, { useEffect, useRef, useState } from "react";
// import { connect } from "react-redux";
// import Loader from "../loader";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";

export default function ResultsComponent({ dataFile }) {
  // const { dataFile, models } = props;
  const models = cocossd.load();

  const videoRef = useRef(null);
  const videoStreamRef = useRef(null);
  const canvasRef = useRef(null);
  const [videoObj, setVideoObj] = useState(null);
  const [changingVideo, setChangingVideo] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [xRatio, setXratio] = useState(1);
  const [yRatio, setYratio] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function drawBbox(predictions) {
      predictions.forEach((pred) => {
        const { bbox, class: _class, score } = pred;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        //clear pre-existing stroke
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const [x, y, width, height] = bbox;
        const _x = x * xRatio;
        const _y = y * yRatio;
        const _width = width * xRatio;
        const _height = height * yRatio;

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#ec0707";
        ctx.font = "18px serif";
        ctx.fillStyle = "#ec0707";

        ctx.strokeRect(_x, _y, _width, _height);
        ctx.fillText(``, _x, y - 10, _width, _height);
        ctx.fillText(
          `${_class} ${(score * 100).toFixed(2)}%`,
          _x,
          _y - 10,
          _width
        );
      });
    }

    async function runPredictions() {
      if (videoPlaying && videoObj && streamReady && videoStreamRef.current) {
        const { coco_ssd } = models;
        const _videoStream = videoStreamRef.current;
        let lastTime = -1;

        _videoStream.ontimeupdate = async (event) => {
          const { target } = event;
          const { currentTime } = _videoStream;

          if (currentTime !== lastTime && currentTime > lastTime + 0.35 && !busy) {
            lastTime = currentTime;
            setBusy(() => true);
            const predictions = await coco_ssd.detect(target);
            drawBbox(predictions);
            setBusy(() => false);
          }
        };
      }
    }

    runPredictions();
  }, [videoPlaying, videoObj, models, streamReady, xRatio, yRatio]);

  useEffect(() => {
    async function detect() {
      if (videoObj) {
        const _video = videoRef.current;
        const _videoStream = videoStreamRef.current;

        _video.onloadeddata = () => {
          const widthRatio = _video.width / _video.videoWidth;
          const _height = widthRatio * _video.videoHeight;
          _videoStream.height = _height;
          canvasRef.current.height = _height;
          console.log(_video.videoWidth);
          console.log(_video.videoHeight);
          setXratio(widthRatio);
          setYratio(_height / _video.videoHeight);
          setStreamReady(true);
          _videoStream.srcObject = _video.captureStream(0);
        };

        _video.onplay = () => {
          console.log("Started");
          setVideoPlaying(true);
          _videoStream.play();
          // Set canvas width
          canvasRef.current.width = _videoStream.width;
          canvasRef.current.height = _videoStream.height;
        };

        _video.onended = () => {
          console.log("ended");
          _videoStream.pause();
          // Do clean-up
          _videoStream.currentTime = 0;
          _videoStream.srcObject = null;
          setVideoPlaying(false);
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        };

        _video.onpause = () => {
          console.log("paused");
          setVideoPlaying(false);
          _videoStream.pause();
        };

        _video.src = URL.createObjectURL(videoObj);
        _video.load();
      }
    }

    detect();
  }, [videoObj]);

  useEffect(() => {
    if (dataFile) {
      setVideoPlaying(false);
      setChangingVideo(true);
      setVideoObj(dataFile);
      setChangingVideo(false);
    }
  }, [dataFile, setChangingVideo, setVideoObj]);

  return (
    <div>
        <>
            <div>
              <video
                id="video-input-video-src"
                ref={videoRef}
                controls
                width="480"
                height="440"
                muted
              />
              <video
                id="video-input-video-stream"
                ref={videoStreamRef}
                width="480"
                playsInline
                muted
              />

              <canvas
                id="webcam-input-canvas"
                ref={canvasRef}
                style={{
                  position: "absolute",
                  marginLeft: "auto",
                  marginRight: "auto",
                  top: "6em",
                  right: "10px",
                  textAlign: "right",
                  zindex: 9,
                  width: 480,
                }}
              />
            </div>
        </>
    </div>
  );
}

// const mapStateToProps = (state) => {
//   const { models } = state;
//   return { models };
// };

// export default connect(mapStateToProps, null)(ResultsComponent);