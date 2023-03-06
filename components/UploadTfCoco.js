import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import { useState } from "react";

import { useEffect, useRef } from "react";

export default function Tensorflow({downloadURL}) {
    const vidRef = useRef();
    const [busy, setBusy] = useState(false);
    const [playing, setPlaying] = useState(false);

    function predict() {
        const vid = vidRef.current;
        // console.log(vid);

        // Load the model.
        cocossd.load().then(model => {
        // detect objects in the image.
        model.detect(vid).then(predictions => {
        console.log('Predictions: ', predictions);
            });
        });
    }

    function prediction_loop() {

      //  Loop and detect hands
      setInterval(() => {
        detect();
      }, 100);
    }

    function detect() {
      if (!busy && playing) {

        const vid = vidRef.current;

        setBusy(() => true);
        // Load the model.
        cocossd.load().then(model => {
          // detect objects in the image.
          model.detect(vid).then(predictions => {
          console.log('Predictions: ', predictions);
              });
          });
        setBusy(() => false);
      }
    }

    function play() {
      vidRef.current.play();
      setPlaying(() => true);
    }

    function pause() {
      () => vidRef.current.pause();
      setPlaying(() => false);
    }

    // if (!busy && playing) {

    //   const vid = vidRef.current;

    //   setBusy(() => true);
    //   // Load the model.
    //   cocossd.load().then(model => {
    //     // detect objects in the image.
    //     model.detect(vid).then(predictions => {
    //     console.log('Predictions: ', predictions);
    //         });
    //     });
    //   setBusy(() => false);
    // }

    return (
        <div>
            <video 
            src={downloadURL} 
            ref={vidRef}
            width = "600" 
            crossOrigin="anonymous"
            />
            <button onClick={predict}> 
                Predict Class 
            </button>
            <button onClick={prediction_loop}>
                Predict loop start 👻
            </button>
            <button onClick={play}>
                Play
            </button>
            <button onClick={pause}>
                Pause
            </button>
        </div>
    )
}