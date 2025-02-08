import {loadSimulator, vue} from "./view-manager.js";

const speedSlider = document.querySelector("#sim-speed");
const selectScenarios = document.querySelector("#select-scenarios");
const selectRobots = document.querySelector("#select-robot");
const selectRobotsSimulator = document.querySelector("#select-robot-sim");
const configurationChoice = document.querySelector("#select-configuration");

export let currentRobotId = null;
export let currentConfig = "Billard";
export let currentScenario = "default";

export let afficherDessins = true;
export let simulatorSpeed = 1;

export let leftSpeed = 130;
export let rightSpeed = 130;
export let duration = 1000;

window.addEventListener("load", () => {
    selectScenarios.addEventListener("change", (event) => {
        currentScenario = event.target.value;
    });

    selectRobots.addEventListener("change", (event) => {
        currentRobotId = event.target.value;
    });

    speedSlider.addEventListener("change", (event) => {
        simulatorSpeed = event.target.value;
        vue.changeSpeed();
    })

    selectRobotsSimulator.addEventListener("change", (event) => {
        let optionName = event.target.value;
        currentRobotId = optionName[optionName.length - 1] - 1;
    });

    // Choose a configuration for the simulator
    configurationChoice.addEventListener("change", (event) => {
        loadSimulator(event.target.value);
    });
});

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
