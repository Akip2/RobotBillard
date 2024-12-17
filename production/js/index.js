import VueSimulateur from "../simulateur/vue-simulateur.js";
import RandomConfig from "../simulateur/configurations/random-config.js";
import CollisionController from "../simulateur/collision-controller.js";
import BillardConfig from "../simulateur/configurations/billard-config.js";

import {setSillContinue} from "./video.js";

const socket = io(); //Connection to server

// loader
const loader = document.querySelector("#loader-container");

// header
const viewsList = document.querySelector("#views-list");

// main
const leftPart = document.querySelector("#left-part");
const rightPart = document.querySelector("#right-part");

// left part
const topTableSimulator = document.querySelector("#top-table-container");
const reload = document.querySelector("#reload-btn");
const canvasContainer = document.querySelector("#canvas-container");
const canvas = document.querySelector("#canvas-output-video");

// right part
const viewGoScenarios = document.querySelector("#go-scenarios");
const viewArrowControls = document.querySelector("#arrow-controls");

// viewGoScenarios
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


let speedGauche = 130;
let speedDroit = 130;

let duration = 1000;


function createOrder(left, right, duration) {
    return {
        left: left,
        right: right,
        duration: duration,
        time: Date.now()
    };
}

window.addEventListener("load", () => {

    setTimeout(() => {
        loader.style.display = "none";
    }, 1000);

    reload.addEventListener("click" , () => {
        loadSimulator();
    });

    inputDuration.addEventListener("input", () => {
        let durationBeforeTest = inputDuration.value;
        // we check if time is really between 100ms and 10.000ms
        duration = durationBeforeTest < 100 ? 100 : durationBeforeTest > 10000 ? 10000 : durationBeforeTest;
        console.log(duration);
    });

    cursorLeftMotor.addEventListener("input", () => {
        speedGauche = cursorLeftMotor.value;
    });

    cursorRightMotor.addEventListener("input", () => {
        speedDroit = cursorRightMotor.value;
    });

    btnForward.addEventListener("click", () => {
        socket.emit('motor', createOrder(speedGauche, speedDroit, duration));
    });

    btnBackward.addEventListener("click", () => {
        socket.emit('motor', createOrder(-speedGauche, -speedDroit, duration));
    });

    btnTurnRight.addEventListener("click", () => {
        socket.emit('motor', createOrder(-speedGauche, speedDroit, duration));
    });

    btnTurnLeft.addEventListener("click", () => {
        socket.emit('motor', createOrder(speedGauche, -speedDroit, duration));
    });

    viewsList.addEventListener("click", (event) => {
        switch (event.target.id) {
            case "camera":
                showCanvas();
                tryAdd(viewGoScenarios);
                tryRemove(viewArrowControls)
                hide(topTableSimulator);
                setSillContinue(true);
                break;
            case "simulator":
                hide(canvas);
                loadSimulator();
                tryAdd(viewGoScenarios);
                tryAdd(viewArrowControls)
                show(topTableSimulator);
                setSillContinue(false);
                break;
            case "manual":
                showCanvas();
                tryRemove(viewGoScenarios);
                tryAdd(viewArrowControls)
                hide(topTableSimulator);
                setSillContinue(true);
                break;
            default:
                console.log("Erreur : vue inconnue");
        }
    });
});

// to show a view
function show(element) {
    element.classList.remove("displayNone");
    element.classList.add("displayFlex");
}

// to hide a view
function hide(element) {
    element.classList.remove("displayFlex");
    element.classList.add("displayNone");
}

// add an element if it's not already displayed
function tryAdd(element) {
    if(element.classList.contains("displayNone")) {
        element.classList.remove("displayNone");
        element.classList.add("displayFlex");
    }
}

// remove an element if it's already
function tryRemove(element) {
    if(element.classList.contains("displayFlex")) {
        element.classList.remove("displayFlex");
        element.classList.add("displayNone");
    }
}

function showCanvas() {
    if(canvas.classList.contains("displayNone")) {
        let potentialCanvas = document.querySelector("#canvas-simulateur");
        if(potentialCanvas != null){
            hide(potentialCanvas);
            show(canvas);
        }
    }
}

function loadSimulator() {
    let canvasSimulateur = document.querySelector("#canvas-simulateur");
    if (canvasSimulateur !== null) {
        canvasContainer.removeChild(canvasSimulateur);
    }

    let vue = new VueSimulateur(canvasContainer);
    vue.setup();
    vue.run();

    //let table=new RandomConfig(vue);
    let table = new BillardConfig(vue);
    let colController = new CollisionController(table);
    colController.createEvent(vue.engine);
    table.notifyView();
}