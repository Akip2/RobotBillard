import VueSimulateur from "../simulateur/vue-simulateur.js";
import CollisionController from "../simulateur/collision-controller.js";
import Camera from "../simulateur/camera.js";

// Billard configurations
import RandomConfig from "../simulateur/configurations/random-config.js";
import BillardConfig from "../simulateur/configurations/billard-config.js";
import EasyConfig from "../simulateur/configurations/easy-config.js";
import FootConfig from "../simulateur/configurations/foot-config.js";

import {getRealRobot, getRealRobots, setStillContinue} from "./video.js";
import {createOrder, moveRobotTo} from "./brain.js";
import vueSimulateur from "../simulateur/vue-simulateur.js";

const socket = io(); // Connection to server

// loader
const loader = document.querySelector("#loader-container");

// header
const viewsList = document.querySelector("#views-list");

// main
const leftPart = document.querySelector("#left-part");
const rightPart = document.querySelector("#right-part");

// LEFT PART
const topTableSimulator = document.querySelector("#top-table-container");
const reload = document.querySelector("#reload-btn");
const configurationChoice = document.querySelector("#select-configuration");
const canvasContainer = document.querySelector("#canvas-container");
const canvas = document.querySelector("#canvas-output-video");

// RIGHT PART
const viewGoScenarios = document.querySelector("#robots-go-scenarios");
const viewArrowControls = document.querySelector("#arrow-controls");

// viewGoScenarios
const goBtn = document.querySelector("#go-btn");
const selectScenarios = document.querySelector("#select-scenarios");
const selectRobots = document.querySelector("#select-curent-robot");

// viewArrowControls
const btnForward = document.querySelector("#btn-forward");
const btnBackward = document.querySelector("#btn-backward");
const btnTurnLeft = document.querySelector("#btn-turn-left");
const btnTurnRight = document.querySelector("#btn-turn-right");
const cursorLeftMotor = document.querySelector("#cursor-left-motor");
const cursorRightMotor = document.querySelector("#cursor-right-motor");
const inputDuration = document.querySelector("#input-duration");

let curentConfig = "Random";
// let curentRobot;
let vue = null;
let table = null;
let camera = null;

let currentView = "camera";

let speedGauche = 130;
let speedDroit = 130;

let duration = 1000;

window.addEventListener("load", () => {

    // socket.emit('get-robots');

    selectRobots.addEventListener("change", (event) => {
        // curentRobot = event.target.value;
    });

    // Reload the simulation
    reload.addEventListener("click", () => {
        loadSimulator(curentConfig);
    });

    // Execution time of the motors
    inputDuration.addEventListener("input", () => {
        let durationBeforeTest = inputDuration.value;
        // We check if time is really between 100ms and 10.000ms
        duration = durationBeforeTest < 100 ? 100 : durationBeforeTest > 10000 ? 10000 : durationBeforeTest;
        console.log(duration);
    });

    // Buttons to move robots
    cursorLeftMotor.addEventListener("input", () => {
        speedGauche = cursorLeftMotor.value;
    });
    cursorRightMotor.addEventListener("input", () => {
        speedDroit = cursorRightMotor.value;
    });
    btnForward.addEventListener("click", () => {
        socket.emit('motor', createOrder(speedGauche, speedDroit, duration/*, curentRobot*/));
    });
    btnBackward.addEventListener("click", () => {
        socket.emit('motor', createOrder(-speedGauche, -speedDroit, duration/*, curentRobot*/));
    });
    btnTurnRight.addEventListener("click", () => {
        socket.emit('motor', createOrder(-speedGauche, speedDroit, duration/*, curentRobot*/));
    });
    btnTurnLeft.addEventListener("click", () => {
        socket.emit('motor', createOrder(speedGauche, -speedDroit, duration/*, curentRobot*/));
    });

    // Change curent view
    viewsList.addEventListener("click", (event) => {
        socket.emit("change-mode", event.target.id);
        currentView = event.target.id;
        switch (currentView) {
            case "camera":
                showCanvas();
                tryAdd(viewGoScenarios);
                tryRemove(viewArrowControls)
                hide(topTableSimulator);
                setStillContinue(true);
                break;
            case "simulator":
                hide(canvas);
                loadSimulator();
                tryAdd(viewGoScenarios);
                tryAdd(viewArrowControls)
                show(topTableSimulator);
                setStillContinue(false);
                break;
            case "manual":
                showCanvas();
                tryRemove(viewGoScenarios);
                tryAdd(viewArrowControls)
                hide(topTableSimulator);
                setStillContinue(true);
                break;
            default:
                console.log("Erreur : vue inconnue");
        }
    });

    // Choose a configuration for the simulator
    configurationChoice.addEventListener("change", (event) => {
        loadSimulator(event.target.value);
    });

    canvasContainer.addEventListener("click", (event) => {
        let simulatorCanvas = document.querySelector("#canvas-simulateur");
        let isSimulator = simulatorCanvas ? !simulatorCanvas.classList.contains("displayNone") : false;

        let x = event.offsetX;
        let y = event.offsetY;

        if (isSimulator) {
            // Get the position of a click on the simulator
            console.log("Simulator : (" + x + ", " + y + ")");
            // turnRobot(socket, 90)
            // moveRobotForward(socket, 50);
            moveRobotTo(socket, 0, x, y);
            // turnRobotInCircle(socket, 10, 360);
        } else {
            // Get the position of a click on the camera
            console.log("Camera : (" + x + ", " + y + ")");
            moveRobotTo(socket, 0, x, y);
        }
    });

    // Loader
    setTimeout(() => {
        loader.style.display = "none";
    }, 1000);
});

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
    if (canvas.classList.contains("displayNone")) {
        let potentialCanvas = document.querySelector("#canvas-simulateur");
        if (potentialCanvas != null) {
            canvasContainer.classList.remove("simulator-container");
            hide(potentialCanvas);

            if(camera !== null){
                camera.stop();
            }

            if(vue !== null){
                vue.clearSimulation();
            }

            show(canvas);
        }
    }
}

function loadSimulator(configurationName) {
    if(camera !== null && camera.isRunning) {
        camera.stop();
    }
    if(vue !== null && vue.isRunning) {
        vue.clearSimulation();
    }

    canvasContainer.classList.add("simulator-container");
    vue = new VueSimulateur(canvasContainer);
    camera = new Camera(canvasContainer, vue);

    curentConfig = configurationName;

    switch (configurationName) {
        case "Random":
            table = new RandomConfig(vue, camera);
            break;
        case "Billard":
            table = new BillardConfig(vue, camera);
            break;
        case "Foot":
            table = new FootConfig(vue, camera);
            break;
        case "Facile":
            table = new EasyConfig(vue, camera);
            break;
        default:
            curentConfig = "Random";
            table = new RandomConfig(vue, camera);
    }

    let colController = new CollisionController(table);

    colController.createEvent(vue.engine);
    table.run();
}

export function getRobots() {
    if (currentView === "simulator") {
        return table.robots;
    }
    return getRealRobots();
}

export function getRobot(index) {
    if (currentView === "simulator") {
        return {
            position:
                {
                    x: table.robots[index].body.position.x,
                    y: table.robots[index].body.position.y
                },
            orientation: table.robots[index].body.angle * (180 / Math.PI)
        };
    }
    return getRealRobot(index);
}

socket.on("robots-list", function (robots) {
    selectRobots.innerHTML = "";
    if (robots != null && robots.length > 0) { // test that the number of detected robot in not null
        robots.forEach(function (robot) {
            let option = document.createElement("option");
            option.text = robot;
            selectRobots.appendChild(option);
        });
    } else {
        let option = document.createElement("option");
        option.text = "Aucun robot disponible";
        selectRobots.appendChild(option);
    }
});

socket.on('connect', function () {

    console.log("Connected to server with ID : ", socket.id);

    socket.on("motor", function (order) {
        table.sendRobotOrder(order); // Send order to simulator
    });

    socket.on("ask-identity", function () {
        socket.emit("is-interface", currentView);
    });
});