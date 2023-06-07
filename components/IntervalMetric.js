import React, { useState, useEffect } from 'react';

export default function IntervalMetric({playing,dogInView}) {

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
        if (playing) {
            setSeconds(seconds => seconds + 1);
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [playing]);

  return (
    <div>
      <header>
        {seconds} seconds of total stream time, {dogInView} dog visible.
      </header>
    </div>
  );
};

// export default IntervalExample;