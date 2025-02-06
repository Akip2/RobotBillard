// Ce fichier contient : récupération et ajout d'évènements des éléments du DOM

import {startBillardScenario} from "../scenarios/billardScenario.js";
import {startTestScenario} from "../scenarios/testScenario.js";
import {createOrder, moveRobotTo} from "../brain.js";
import {socket} from "../index.js";
import {afficherDetection, currentView, loadSimulator} from "./view-manager.js";
import {
    afficherDessins,
    currentConfig,
    currentRobotId,
    currentScenario,
    duration,
    leftSpeed,
    rightSpeed
} from "./parameters.js";

// loader
const loader = document.querySelector("#loader-container");

// LEFT PART
export const reload = document.querySelector("#reload-btn");
export const configurationChoice = document.querySelector("#select-configuration");
export const canvasContainer = document.querySelector("#canvas-container");
export const videoBrut = document.querySelector("#canvas-output-video-brut");
export const videoDessin = document.querySelector("#canvas-output-video");
export const affichage = document.querySelector("#checkbox-affichage");

// RIGHT PART
export const viewGoScenarios = document.querySelector("#robots-go-scenarios");
export const viewArrowControls = document.querySelector("#arrow-controls");

// viewGoScenarios
export const goBtn = document.querySelector("#go-btn");
export const selectScenarios = document.querySelector("#select-scenarios");
export const selectRobots = document.querySelector("#select-robot");
export const selectRobotsSimulator = document.querySelector("#select-robot-sim");
export const speedContainer = document.querySelector("#speed-container");
const speedSlider = document.querySelector("#sim-speed");

// viewArrowControls
export const btnForward = document.querySelector("#btn-forward");
export const btnBackward = document.querySelector("#btn-backward");
export const btnTurnLeft = document.querySelector("#btn-turn-left");
export const btnTurnRight = document.querySelector("#btn-turn-right");
export const cursorLeftMotor = document.querySelector("#cursor-left-motor");
export const cursorRightMotor = document.querySelector("#cursor-right-motor");
export const inputDuration = document.querySelector("#input-duration");

window.addEventListener("load", () => {

    selectScenarios.addEventListener("change", (event) => {
        currentScenario = event.target.value;
    });

    goBtn.addEventListener("click", () => {
        switch (currentScenario) {
            case "Billard":
                startBillardScenario(socket, 0);
                break;
            case "default":
                startTestScenario(socket, 0);
                break;
        }
    });

    // Reload the simulation
    reload.addEventListener("click", () => {
        loadSimulator(currentConfig);
    });

    // Execution time of the motors
    inputDuration.addEventListener("input", () => {
        let durationBeforeTest = inputDuration.value;
        // We check if time is really between 100ms and 10.000ms
        duration = durationBeforeTest < 100 ? 100 : durationBeforeTest > 10000 ? 10000 : durationBeforeTest;
    });

    // Buttons to move robots
    cursorLeftMotor.addEventListener("input", () => {
        leftSpeed = cursorLeftMotor.value;
    });
    cursorRightMotor.addEventListener("input", () => {
        rightSpeed = cursorRightMotor.value;
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

    canvasContainer.addEventListener("click", (event) => {
        let simulatorCanvas = document.querySelector("#canvas-simulateur");
        let isSimulator = simulatorCanvas ? !simulatorCanvas.classList.contains("displayNone") : false;

        let x = event.offsetX;
        let y = event.offsetY;

        if (isSimulator) {
            // Get the position of a click on the simulator
            moveRobotTo(socket, currentRobotId, x, y);
            // turnRobotInCircle(socket, 0);
        } else {
            // Get the position of a click on the camera
            moveRobotTo(socket, currentRobotId, x, y);
        }
    });

    affichage.addEventListener("change", function () {
        afficherDessins = affichage.checked;
        if (currentView !== "simulator") {
            afficherDetection(afficherDessins);
        }
        // pour le simulateur, la gestion des dessins est gérée par la classe VueSimulateur (drawDetectedCircles) grace à la variable afficherDessins
    });

    // Loader
    setTimeout(() => {
        loader.style.display = "none";
    }, 1500);
});