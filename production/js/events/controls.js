// viewArrowControls
import {
    currentRobotId,
    duration,
    leftSpeed,
    rightSpeed,
    setDuration,
    setLeftSpeed,
    setRightSpeed,
} from "./parameters.js";
import {socket} from "../index.js";
import {createOrder} from "../brain/brain.js";
import {MAX_ORDER_DURATION, MIN_ORDER_DURATION} from "../brain/brain-parameters.js";

const btnForward = document.querySelector("#btn-forward");
const btnBackward = document.querySelector("#btn-backward");
const btnTurnLeft = document.querySelector("#btn-turn-left");
const btnTurnRight = document.querySelector("#btn-turn-right");
const cursorLeftMotor = document.querySelector("#cursor-left-motor");
const cursorRightMotor = document.querySelector("#cursor-right-motor");
const inputDuration = document.querySelector("#input-duration");


export function initControls() {
    // Execution time of the motors
    inputDuration.addEventListener("input", () => {
        let initialDuration = inputDuration.value;
        let duration = initialDuration;

        // We check if time is really between 100ms and 10.000ms
        if (initialDuration < MIN_ORDER_DURATION) {
            duration = MIN_ORDER_DURATION;
        } else if (initialDuration > MAX_ORDER_DURATION) {
            duration = MAX_ORDER_DURATION;
        }
        setDuration(duration);
    });

    // Buttons to move robots
    cursorLeftMotor.addEventListener("input", () => {
        setLeftSpeed(cursorLeftMotor.value);
    });
    cursorRightMotor.addEventListener("input", () => {
        setRightSpeed(cursorRightMotor.value);
    });
    btnForward.addEventListener("click", () => {
        socket.emit('motor', createOrder(leftSpeed, rightSpeed, duration, currentRobotId));
    });
    btnBackward.addEventListener("click", () => {
        socket.emit('motor', createOrder(-leftSpeed, -rightSpeed, duration, currentRobotId));
    });
    btnTurnRight.addEventListener("click", () => {
        socket.emit('motor', createOrder(leftSpeed, -rightSpeed, duration, currentRobotId));
    });
    btnTurnLeft.addEventListener("click", () => {
        socket.emit('motor', createOrder(-leftSpeed, rightSpeed, duration, currentRobotId));
    });
}