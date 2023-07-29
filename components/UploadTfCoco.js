import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import { useEffect, useRef, useState } from "react";

import {drawRect} from '@/lib/utilities'

export default function UploadTfCoco({downloadURL,playing,setPlaying,setDogInView}) {
  const vidRef = useRef();
  const canvasRef = useRef(null);
  const [busy, setBusy] = useState(false);
  // const [playing, setPlaying] = useState(false);
  const [net, setNet] = useState();

  const DETECT_INTERVAL = 5; // milli-seconds 
  const VIDEO_WIDTH = 800; //600

  var pred_len;
  var num_total_pred=0;
  var num_dog_pred=0;

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
    async function detect(vid,ctx) {
      if (!busy && playing && downloadURL && vid.readyState) {

        setBusy(() => true);
        // Make Detections
        const predictions = await net.detect(vid);

        pred_len = predictions.length;
        for (let i=0;i<pred_len;i++) {
          // console.log('Predictions: ',predictions[i]);
          if (predictions[i].class == "dog" && predictions[i].score > 0.80) {
            console.log('Predictions: ',predictions[i].class, "| Confidence: ", predictions[i].score);
            num_dog_pred++;
          }
          num_total_pred++;
        }

        setDogInView(num_dog_pred/num_total_pred)
        
        //clear pre-existing stroke
        // ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draws video image onto canvas
        ctx.drawImage(vid,0,0,VIDEO_WIDTH,heightScaled);

        // Update drawing utility
        drawRect(predictions, ctx, xratio);

        setBusy(() => false);
      }
    }

    // Convert original resolution of video to canvas resolution
    const xratio = (VIDEO_WIDTH / vidRef.current.videoWidth);
    const heightScaled  = (xratio*vidRef.current.videoHeight);

    const vid = vidRef.current;
    const canvas = canvasRef.current;
    canvasRef.current.width = VIDEO_WIDTH;
    canvasRef.current.height = heightScaled;

    // Draw mesh
    const ctx = canvas.getContext("2d");
    // draws video image onto canvas
    ctx.drawImage(vid,0,0,VIDEO_WIDTH,heightScaled);

    //  Loop detection
    const interval = setInterval(() => {
      detect(vid,ctx);
    }, DETECT_INTERVAL);

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

  useEffect( ()=> {
    var element = document.getElementById("vidDiv");
    element.style.display = "none";
  },[])

  return (
      <>
      <div>
        <button onClick={playing ? pause : play}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <canvas
          ref={canvasRef}
          width={VIDEO_WIDTH} />


      </div>

      <div
      id="vidDiv">
      <video
        // autoPlay 
        // controls
        onEnded={() => setPlaying(false)}
        src={downloadURL}
        ref={vidRef}
        width={VIDEO_WIDTH}
        height="400"
        crossOrigin="anonymous" />
      </div>
      </>



  )
}