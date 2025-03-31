import {afficherDetection, currentView, loadSimulator, updateRobotList, vue} from "./view-manager.js";
import {BROADCAST} from "../brain/brain-parameters.js";
import {getRobotIp} from "../elements-manager.js";

const fond = document.querySelector("#fond");
const btnOptions = document.querySelector("#btn-options");
const optionsMenu = document.querySelector("#menu-options");
const croix = document.querySelector("#croix");
const speedSlider = document.querySelector("#sim-speed");
const selectScenarios = document.querySelector("#select-scenarios");
const selectRobots = document.querySelector("#select-robot");
const selectRobotsSimulator = document.querySelector("#select-robot-sim");
const configurationChoice = document.querySelector("#select-configuration");
const affichage = document.querySelector("#checkbox-affichage");
const affichageVision = document.querySelector("#checkbox-vision-anti-collision");
const noiseSlider = document.querySelector("#noise");

export let currentRobotId = BROADCAST;
export let currentRobotIp = BROADCAST;

export let currentConfig = "Billard";
export let currentScenario = "default";

export let afficherDessins = true;
export let simulatorSpeed = 1;
export let afficherVisionAntiCollision = false;

export let leftSpeed = 130;
export let rightSpeed = 130;
export let duration = 1000;

export let noise = 1;

export function initParams() {

    btnOptions.addEventListener("click", () => {
        fond.classList.remove("displayNone");
    });

    fond.addEventListener("click", (event) => {
        let clickedElement = event.target;
        // on vérifie que l'élément cliqué est soit en dehors du menu ou alors est la croix
        if (!optionsMenu.contains(clickedElement) || clickedElement === croix) {
            // on peut alors fermer le menu
            fond.classList.add("displayNone");
        }
    })

    selectScenarios.addEventListener("change", (event) => {
        currentScenario = event.target.value;
    });

    selectRobots.addEventListener("change", (event) => {
        const optionName = event.target.value;
        currentRobotId = optionName === "Broadcast" ? BROADCAST : Number(optionName);
        currentRobotIp = getRobotIp(currentRobotId);
        console.log(currentRobotIp);
    });

    speedSlider.addEventListener("change", (event) => {
        simulatorSpeed = event.target.value;
        vue.changeSpeed();
    });

    selectRobotsSimulator.addEventListener("change", (event) => {
        const optionName = event.target.value;
        currentRobotId = optionName === "Broadcast" ? BROADCAST : Number(optionName[optionName.length - 1]);
        currentRobotIp = currentRobotId;
    });

    // Choose a configuration for the simulator
    configurationChoice.addEventListener("change", (event) => {
        loadSimulator(event.target.value);
        updateRobotList();
    });

    affichage.addEventListener("change", function () {
        afficherDessins = affichage.checked;
        if (currentView !== "simulator") {
            afficherDetection(afficherDessins);
        }
        // pour le simulateur, la gestion des dessins est gérée par la classe VueSimulateur (drawDetectedCircles) grace à la variable afficherDessins
    });

    affichageVision.addEventListener("change", function () {
        afficherVisionAntiCollision = affichageVision.checked;
    });

    noiseSlider.addEventListener("change", (event) => {
        noise = event.target.value;
    })
}

export function setCurrentConfig(config) {
    currentConfig = config;
}

export function setCurrentRobotId(id) {
    currentRobotId = id;
    currentRobotIp = getRobotIp(id);
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
