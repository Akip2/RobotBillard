// Ce fichier contient : récupération et ajout d'évènements des éléments du DOM

import {startBillardScenario} from "../scenarios/billardScenarioSimple.js";
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
    rightSpeed,
    simulatorSpeed,
    setAfficherDessins,
    setCurrentScenario,
    setDuration,
    setLeftSpeed,
    setRightSpeed
} from "./parameters.js";

// loader
const loader = document.querySelector("#loader-container");

export const reload = document.querySelector("#reload-btn");
export const canvasContainer = document.querySelector("#canvas-container");
export const affichage = document.querySelector("#checkbox-affichage");

// viewGoScenarios
export const selectRobots = document.querySelector("#select-robot");
const goBtn = document.querySelector("#go-btn");
const selectScenarios = document.querySelector("#select-scenarios");

// viewArrowControls
const btnForward = document.querySelector("#btn-forward");
const btnBackward = document.querySelector("#btn-backward");
const btnTurnLeft = document.querySelector("#btn-turn-left");
const btnTurnRight = document.querySelector("#btn-turn-right");
const cursorLeftMotor = document.querySelector("#cursor-left-motor");
const cursorRightMotor = document.querySelector("#cursor-right-motor");
const inputDuration = document.querySelector("#input-duration");

window.addEventListener("load", () => {

    selectScenarios.addEventListener("change", (event) => {
        setCurrentScenario(event.target.value);
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
        let time = durationBeforeTest < 100 ? 100 : durationBeforeTest > 10000 ? 10000 : durationBeforeTest;
        setDuration(time);
    });

    // Buttons to move robots
    cursorLeftMotor.addEventListener("input", () => {
        setLeftSpeed(cursorLeftMotor.value);
    });
    cursorRightMotor.addEventListener("input", () => {
        setRightSpeed(cursorRightMotor.value);
    });
    btnForward.addEventListener("click", () => {
        socket.emit('motor', createOrder(leftSpeed, rightSpeed, duration/simulatorSpeed, currentRobotId));
    });
    btnBackward.addEventListener("click", () => {
        socket.emit('motor', createOrder(-leftSpeed, -rightSpeed, duration/simulatorSpeed, currentRobotId));
    });
    btnTurnRight.addEventListener("click", () => {
        socket.emit('motor', createOrder(leftSpeed, -rightSpeed, duration/simulatorSpeed, currentRobotId));
    });
    btnTurnLeft.addEventListener("click", () => {
        socket.emit('motor', createOrder(-leftSpeed, rightSpeed, duration/simulatorSpeed, currentRobotId));
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
        setAfficherDessins(affichage.checked);
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