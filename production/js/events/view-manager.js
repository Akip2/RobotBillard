// header
import BillardConfig from "../../simulateur/configurations/billard-config.js";
import Camera from "../../simulateur/camera.js";
import CollisionController from "../../simulateur/collision-controller.js";
import EasyConfig from "../../simulateur/configurations/easy-config.js";
import FootConfig from "../../simulateur/configurations/foot-config.js";
import RandomConfig from "../../simulateur/configurations/random-config.js";
import VueSimulateur from "../../simulateur/vue-simulateur.js";
import {afficherDessins, currentConfig, setCurrentConfig, setCurrentRobotId} from "./parameters.js";
import {canvasContainer, reload, selectRobots, socket} from "../index.js";
import {setStillContinue} from "../video/video.js";

let camera = null;
export let vue = null;
export let table = null;
export let currentView = "camera";

// RIGHT PART
const viewGoScenarios = document.querySelector("#robots-go-scenarios");
const viewArrowControls = document.querySelector("#arrow-controls");

// LEFT PART
const configurationChoice = document.querySelector("#select-configuration");
const videoBrut = document.querySelector("#canvas-output-video-brut");
const videoDessin = document.querySelector("#canvas-output-video");

const selectRobotsSimulator = document.querySelector("#select-robot-sim");
const speedContainer = document.querySelector("#speed-container");
const viewsList = document.querySelector("#views-list");
const noiseContainer = document.querySelector("#noise-container");

export let isSimulator = false;

export function initView() {
    // Change curent view
    viewsList.addEventListener("click", (event) => {
        socket.emit("change-mode", event.target.id);
        currentView = event.target.id;
        switch (currentView) {
            case "camera":
                showVideo(true);
                show(viewGoScenarios);
                hide(viewArrowControls);
                break;
            case "simulator":
                showVideo(false);
                break;
            case "manual":
                showVideo(true);
                hide(viewGoScenarios);
                show(viewArrowControls);
                break;
            default:
                console.log("Erreur : vue inconnue");
        }
    });
}

function showVideo(affiche) {
    if (affiche) { // show video to see the camera output
        isSimulator = false;

        hide(selectRobotsSimulator);
        hide(speedContainer);
        hide(reload);
        hide(configurationChoice);
        hide(noiseContainer);

        showCanvas();
        show(selectRobots);

        afficherDetection(afficherDessins);
        setStillContinue(true);
        setCurrentRobotId(selectRobots.firstChild.innerText);
    } else { // see the simulator canvas
        isSimulator = true;

        hide(videoBrut);
        hide(videoDessin);
        hide(selectRobots);

        show(speedContainer);
        show(selectRobotsSimulator);
        show(viewGoScenarios);
        show(viewArrowControls);
        show(reload);
        show(configurationChoice);
        show(noiseContainer);

        loadSimulator(currentConfig);
        setStillContinue(false);
    }
}

// To show a view
function show(element) {
    element.classList.remove("displayNone");
    element.classList.add("displayFlex");
}

// To hide a view
function hide(element) {
    element.classList.remove("displayFlex");
    element.classList.add("displayNone");
}

function showCanvas() {
    if (videoBrut.classList.contains("displayNone")) {
        let potentialCanvas = document.querySelector("#canvas-simulateur");

        if (potentialCanvas != null) {
            canvasContainer.classList.remove("simulator-container");
            hide(potentialCanvas);

            if (camera !== null) {
                camera.stop();
            }
            if (vue !== null) {
                vue.clearSimulation();
            }
            show(videoBrut);
        }
    }
}

export function afficherDetection(affiche) {
    if (affiche) {
        hide(videoBrut);
        show(videoDessin);
    } else {
        show(videoBrut);
        hide(videoDessin);
    }
}

export function loadSimulator(configurationName) {
    if (camera !== null && camera.isRunning) {
        camera.stop();
    }
    // if we already are on the simulator view, we reinitialize it
    if (vue !== null && vue.isRunning) {
        vue.clearSimulation();
    }

    canvasContainer.classList.add("simulator-container");
    vue = new VueSimulateur(canvasContainer);

    setCurrentConfig(configurationName);

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
            setCurrentConfig("Random");
            table = new RandomConfig(vue);
    }

    let colController = new CollisionController(table);

    colController.createEvent(vue.engine);

    camera = new Camera(canvasContainer, table);
    table.run();
    camera.start();

    selectRobotsSimulator.innerHTML = "";

    let option;
    for (let i = 0; i < table.getRobots().length; i++) {
        option = document.createElement("option");
        option.text = "Robot n°" + (i + 1);
        selectRobotsSimulator.appendChild(option);
    }

    option = document.createElement("option");
    option.text = "Broadcast";
    selectRobotsSimulator.appendChild(option);

    setCurrentRobotId(0);
}
