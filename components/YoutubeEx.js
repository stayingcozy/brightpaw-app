import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";

import { useEffect, useRef } from "react";

export default function Tensorflow({downloadURL}) {
    const vidRef = useRef();

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

    return (
        <div>
            <h1> Tensorflow Example </h1>
            <video 
            src={downloadURL} 
            ref={vidRef}
            width = "600" 
            crossOrigin="anonymous"
            />
            <button onClick={predict}> Predict Class </button>
            <button onClick={() => vidRef.current.play()}>
                Play
            </button>
            <button onClick={() => vidRef.current.pause()}>
                Pause
            </button>
        </div>
    )
}