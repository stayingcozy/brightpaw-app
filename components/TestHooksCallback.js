import {useState, useEffect} from 'react';

export default function TestHooksCallback() {
    const [count, setCount] = useState(false);
    const test = () => {
      console.log("Before", count);
      setCount(!count); // This is async so next console will render the same as before one
      console.log(
        "After",
        count,
        " It is the same as Before due to async state update"
      );
    };
  
    useEffect(() => console.log("The value after update", count), [count]);
  
    return (
      <div>
        <button onClick={test}>Click here</button>
      </div>
    );
  }