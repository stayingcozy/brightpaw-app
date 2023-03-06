import React, { useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";

import { drawRect } from "@/lib/utilities";

export default function UploadTfCoco(downloadURL) {
  const vidRef = useRef(null);
  const canvasRef = useRef(null);

  // Main function
  const runCoco = async () => {
    // Load the network
    const net = await cocossd.load();
    
    //  Loop and detect hands
    // setInterval(() => {
    //   detect(net);
    // }, 20); // 10
  };

  function predict() {
      const vid = vidRef.current;
      console.log(vid);

      // Load the model.
      cocossd.load().then(model => {
      // detect objects in the image.
      model.detect(vid).then(predictions => {
      console.log('Predictions: ', predictions);
          });
      });
  }

  const detect = async (net) => {
    // Check data is available
    if (
      vidRef.current !== null
    ) {
      console.log(vidRef.current);

      // Get Video Properties
      const video = vidRef.current;
      // const videoWidth = vidRef.current.video.videoWidth;
      // const videoHeight = vidRef.current.video.videoHeight;

      // // Set video width
      // vidRef.current.video.width = videoWidth;
      // vidRef.current.video.height = videoHeight;

      // // Set canvas height and width
      // canvasRef.current.width = videoWidth;
      // canvasRef.current.height = videoHeight;

      // Make Detections
      const obj = await net.detect(video);
      console.log(obj);

      // // Draw mesh
      // const ctx = canvasRef.current.getContext("2d");

      // // Update drawing utility
      // drawRect(obj, ctx);
    }
  };

  useEffect(()=>{runCoco()},[]);

  return (
    <main>
        <button onClick={predict}> Predict Class </button>
        <video 
        src={downloadURL} 
        ref={vidRef}
        width = "600" 
        crossOrigin="anonymous"
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 8,
            width: 640,
            height: 480,
          }}
        />
    </main>
  );
}
