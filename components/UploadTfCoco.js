import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";

import { useEffect, useRef, useState } from "react";

export default function Tensorflow({downloadURL}) {
  const vidRef = useRef();
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [net, setNet] = useState();

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

  async function play() {
    vidRef.current.play();
    setPlaying(true);
  }

  async function pause() {
    vidRef.current.pause();
    setPlaying(false);
  }

  // Apply ML model when video is playing
  useEffect( () => {
    async function detect() {
      if (!busy && playing) {
        const vid = vidRef.current;
  
        console.log({playing});
        console.log({busy});
  
        // const model = await cocossd.load();

        setBusy(() => true);
        // // Load the model.
        // cocossd.load().then(model => {
        //   // detect objects in the image.
        //   model.detect(vid).then(predictions => {
        //   console.log('Predictions: ', predictions);
        //       });
        //   });

        // Make Detections
        const predictions = await net.detect(vid);
        console.log('Predictions: ',predictions)

        setBusy(() => false);
      }
    }

    //  Loop detection
    const interval = setInterval(() => {
      detect();
    }, 1000);

    return () => clearInterval(interval); // on unmount clear interval
  }, [playing] ); // dependent on state playing


  async function loadCOCO() {
    const coco = await cocossd.load();
    setNet(coco);
  }
  // Load model on start
  useEffect( () => {
    tf.ready().then(()=>{
      loadCOCO();
    })
  },[])

  return (
      <div>
          <video 
          // autoPlay 
          onEnded={() => setPlaying(false)}
          src={downloadURL} 
          ref={vidRef}
          width = "600" 
          crossOrigin="anonymous"
          />
          {/* <button onClick={predict}> 
              Predict Class 
          </button> */}
          <button onClick={play}>
              Play
          </button>
          <button onClick={pause}>
              Pause
          </button>
      </div>
  )
}