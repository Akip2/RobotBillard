// header
import VueSimulateur from "../../simulateur/vue-simulateur.js";
import RandomConfig from "../../simulateur/configurations/random-config.js";
import BillardConfig from "../../simulateur/configurations/billard-config.js";
import FootConfig from "../../simulateur/configurations/foot-config.js";
import EasyConfig from "../../simulateur/configurations/easy-config.js";
import CollisionController from "../../simulateur/collision-controller.js";
import {setStillContinue} from "../video/video.js";
import {afficherDessins, currentConfig, currentRobotId} from "./parameters.js";
import {
    canvasContainer,
    configurationChoice,
    reload,
    selectRobots,
    selectRobotsSimulator,
    speedContainer,
    videoBrut,
    videoDessin,
    viewArrowControls,
    viewGoScenarios
} from "./index-init.js";
import {socket} from "../index.js";
import Camera from "../../simulateur/camera.js";

export let vue = null;
export let table = null;
export let camera = null;
export let currentView = "camera";

const viewsList = document.querySelector("#views-list");

export function init() {
    // Change curent view
    viewsList.addEventListener("click", (event) => {
        socket.emit("change-mode", event.target.id);
        currentView = event.target.id;
        switch (currentView) {
            case "camera":
                tryRemove(selectRobotsSimulator);
                tryRemove(speedContainer);
                tryAdd(selectRobots);
                showCanvas();
                afficherDetection(afficherDessins);
                tryAdd(viewGoScenarios);
                tryRemove(viewArrowControls);
                tryRemove(reload);
                tryRemove(configurationChoice);
                setStillContinue(true);
                currentRobotId = selectRobots.firstChild.innerText;
                break;
            case "simulator":
                tryRemove(videoBrut);
                tryRemove(videoDessin);
                tryAdd(speedContainer);
                tryAdd(selectRobotsSimulator);
                tryRemove(selectRobots);
                loadSimulator(currentConfig);
                tryAdd(viewGoScenarios);
                tryAdd(viewArrowControls);
                tryAdd(reload);
                tryAdd(configurationChoice);
                setStillContinue(false);
                break;
            case "manual":
                tryRemove(selectRobotsSimulator);
                tryRemove(speedContainer);
                tryAdd(selectRobots);
                showCanvas();
                afficherDetection(afficherDessins);
                tryRemove(viewGoScenarios);
                tryAdd(viewArrowControls);
                tryRemove(reload);
                tryRemove(configurationChoice);
                setStillContinue(true);
                currentRobotId = selectRobots.firstChild.innerText;
                break;
            default:
                console.log("Erreur : vue inconnue");
        }
    });
}


// Add an element if it's not already displayed
function tryAdd(element) {
    if (element.classList.contains("displayNone")) {
        element.classList.remove("displayNone");
        element.classList.add("displayFlex");
    }
}

// Remove an element if it's already
function tryRemove(element) {
    if (element.classList.contains("displayFlex")) {
        element.classList.remove("displayFlex");
        element.classList.add("displayNone");
    }
}

function showCanvas() {
    if (videoBrut.classList.contains("displayNone")) {
        let potentialCanvas = document.querySelector("#canvas-simulateur");
        if (potentialCanvas != null) {
            canvasContainer.classList.remove("simulator-container");
            tryRemove(potentialCanvas);

            if (camera !== null) {
                camera.stop();
            }

            if (vue !== null) {
                vue.clearSimulation();
            }

            tryAdd(videoBrut);
        }
    }
}

export function afficherDetection(boolean) {
    if (boolean) {
        tryRemove(videoBrut);
        tryAdd(videoDessin);
    } else {
        tryAdd(videoBrut);
        tryRemove(videoDessin);
    }
}

export function loadSimulator(configurationName) {
    if (camera !== null && camera.isRunning) {
        camera.stop();
    }
    if (vue !== null && vue.isRunning) {
        vue.clearSimulation();
    }

    canvasContainer.classList.add("simulator-container");
    vue = new VueSimulateur(canvasContainer);

    currentConfig = configurationName;

    switch (configurationName) {
        case "Random":
            table = new RandomConfig(vue);
            break;
        case "Billard":
            table = new BillardConfig(vue);
            break;
        case "Foot":
            table = new FootConfig(vue);
            break;
        case "Facile":
            table = new EasyConfig(vue);
            break;
        default:
            currentConfig = "Random";
            table = new RandomConfig(vue);
    }

    let colController = new CollisionController(table);

    colController.createEvent(vue.engine);

    camera = new Camera(canvasContainer, table);
    table.run();
    camera.start();

    selectRobotsSimulator.innerHTML = "";

    for (let i = 0; i < table.getRobots().length; i++) {
        let option = document.createElement("option");
        option.text = "Robot n°" + (i + 1);
        selectRobotsSimulator.appendChild(option);
    }

    currentRobotId = 0;
}
