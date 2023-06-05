import { Joystick, IJoystickUpdateEvent } from 'react-joystick-component';

export default function joystick() {

    async function onMove (IJoystickUpdateEvent) {
        console.log("Moved.")
    };

    const onStop = () => {
        console.log("Stop.")
    };

    return (
        // <Joystick 
        //     size={100} sticky={true} baseColor="red" stickColor="blue" move={handleMove} stop={handleStop}>
        // </Joystick>
        <Joystick
            start={action("Started")} move={onMove(IJoystickUpdateEvent)} stop={onStop}/>
    );
}

