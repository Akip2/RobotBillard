import {afficherDetection, currentView, loadSimulator} from "./view-manager.js";
import {vue} from "./view-manager.js";

const speedSlider = document.querySelector("#sim-speed");
const selectScenarios = document.querySelector("#select-scenarios");
const selectRobots = document.querySelector("#select-robot");
const selectRobotsSimulator = document.querySelector("#select-robot-sim");
const configurationChoice = document.querySelector("#select-configuration");
const affichage = document.querySelector("#checkbox-affichage");

export let currentRobotId = null;
export let currentConfig = "Billard";
export let currentScenario = "default";

export let afficherDessins = true;
export let simulatorSpeed = 1;

export let leftSpeed = 130;
export let rightSpeed = 130;
export let duration = 1000;


export function initParams(){
    selectScenarios.addEventListener("change", (event) => {
        currentScenario = event.target.value;
    });

    selectRobots.addEventListener("change", (event) => {
        const optionName = event.target.value;
        currentRobotId = optionName === "Broadcast" ? -1 : optionName;
    });

    speedSlider.addEventListener("change", (event) => {
        simulatorSpeed = event.target.value;
        vue.changeSpeed();
    });

    selectRobotsSimulator.addEventListener("change", (event) => {
        const optionName = event.target.value;

        if(optionName === "Broadcast"){
            currentRobotId = -1;
        } else {
            currentRobotId = optionName[optionName.length - 1] - 1;
        }
    });

    // Choose a configuration for the simulator
    configurationChoice.addEventListener("change", (event) => {
        loadSimulator(event.target.value);
    });

    affichage.addEventListener("change", function () {
        setAfficherDessins(affichage.checked);
        if (currentView !== "simulator") {
            afficherDetection(afficherDessins);
        }
        // pour le simulateur, la gestion des dessins est gérée par la classe VueSimulateur (drawDetectedCircles) grace à la variable afficherDessins
    });
}

export function setCurrentConfig(config) {
    currentConfig = config;
}

export function setCurrentRobotId(id) {
    currentRobotId = id;
}

export function setAfficherDessins(affiche) {
    afficherDessins = affiche;
}

export function setCurrentScenario(sc) {
    currentScenario = sc;
}

export function setDuration(time) {
    duration = time;
}

export function setLeftSpeed(speed) {
    leftSpeed = speed;
}

export function setRightSpeed(speed) {
    rightSpeed = speed;
}
