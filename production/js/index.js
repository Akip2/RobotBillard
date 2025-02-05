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
import {startTestScenario} from "./scenarios/testScenario.js";

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
const robotChoice = document.querySelector("#select-robot");
const canvasContainer = document.querySelector("#canvas-container");
const canvas = document.querySelector("#canvas-output-video");

// RIGHT PART
const viewGoScenarios = document.querySelector("#robots-go-scenarios");
const viewArrowControls = document.querySelector("#arrow-controls");

// viewGoScenarios
const goBtn = document.querySelector("#go-btn");
const selectScenarios = document.querySelector("#select-scenarios");
const selectRobots = document.querySelector("#select-robot");
const selectRobotsSimulator = document.querySelector("#select-robot-sim");

// viewArrowControls
const btnForward = document.querySelector("#btn-forward");
const btnBackward = document.querySelector("#btn-backward");
const btnTurnLeft = document.querySelector("#btn-turn-left");
const btnTurnRight = document.querySelector("#btn-turn-right");
const cursorLeftMotor = document.querySelector("#cursor-left-motor");
const cursorRightMotor = document.querySelector("#cursor-right-motor");
const inputDuration = document.querySelector("#input-duration");

let currentRobotId = null;
let vue = null;
let table = null;
let camera = null;

let currentView = "camera";
let currentConfig = "Billard";
let currentScenario = "default";


let speedGauche = 130;
let speedDroit = 130;

let duration = 1000;

window.addEventListener("load", () => {

    // socket.emit('get-robots');

    selectScenarios.addEventListener("change", (event) => {
        currentScenario = event.target.value;
    });

    goBtn.addEventListener("click", () => {
        switch (currentScenario) {
            case "default":
                startTestScenario(socket, 0);
                break;
        }
    });

    selectRobots.addEventListener("change", (event) => {
        currentRobotId = event.target.value;
    });

    selectRobotsSimulator.addEventListener("change", (event) => {
        let optionName = event.target.value;
        currentRobotId = optionName[optionName.length - 1] - 1;
    })

    // Reload the simulation
    reload.addEventListener("click", () => {
        loadSimulator(currentConfig);
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
        socket.emit('motor', createOrder(speedGauche, speedDroit, duration, currentRobotId));
    });
    btnBackward.addEventListener("click", () => {
        socket.emit('motor', createOrder(-speedGauche, -speedDroit, duration, currentRobotId));
    });
    btnTurnRight.addEventListener("click", () => {
        socket.emit('motor', createOrder(speedGauche, -speedDroit, duration, currentRobotId));
    });
    btnTurnLeft.addEventListener("click", () => {
        socket.emit('motor', createOrder(-speedGauche, speedDroit, duration, currentRobotId));
    });

    // Change curent view
    viewsList.addEventListener("click", (event) => {
        socket.emit("change-mode", event.target.id);
        currentView = event.target.id;
        switch (currentView) {
            case "camera":
                hide(selectRobotsSimulator);
                show(selectRobots);
                showCanvas();
                tryAdd(viewGoScenarios);
                tryRemove(viewArrowControls);
                tryRemove(reload);
                tryRemove(configurationChoice);
                setStillContinue(true);
                currentRobotId = selectRobots.firstChild.innerText;
                break;
            case "simulator":
                hide(canvas);
                show(selectRobotsSimulator);
                hide(selectRobots);
                loadSimulator(currentConfig);
                tryAdd(viewGoScenarios);
                tryAdd(viewArrowControls);
                tryAdd(reload);
                tryAdd(configurationChoice);
                setStillContinue(false);
                break;
            case "manual":
                hide(selectRobotsSimulator);
                show(selectRobots);
                showCanvas();
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
            moveRobotTo(socket, currentRobotId, x, y);
            // turnRobotInCircle(socket, 10, 360);
        } else {
            // Get the position of a click on the camera
            console.log("Camera : (" + x + ", " + y + ")");
            moveRobotTo(socket, currentRobotId, x, y);
        }
    });

    // Loader
    setTimeout(() => {
        loader.style.display = "none";
    }, 1500);
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

            if (camera !== null) {
                camera.stop();
            }

            if (vue !== null) {
                vue.clearSimulation();
            }

            show(canvas);
        }
    }
}

function loadSimulator(configurationName) {
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

export function getRobots() {
    if (currentView === "simulator") {
        return table.getRobots();
    } else {
        return getRealRobots();
    }
}

export function getRobot(index) {
    if (currentView === "simulator") {
        return {
            position:
                {
                    x: table.robots[index].body.position.x,
                    y: table.robots[index].body.position.y
                },
            orientation: (Math.abs(table.robots[index].body.angle) * (180 / Math.PI)) % 360
        };
    }
    return getRealRobot(index);
}

function addRobot(robotName) {
    let option = document.createElement("option");
    option.text = robotName;
    selectRobots.appendChild(option);
}


socket.on('connect', function () {
    console.log("Connected to server with ID : ", socket.id);

    socket.on("motor", function (order) {
        table.sendRobotOrder(order, order.ipRobot); // Send order to simulator
    });

    socket.on("ask-identity", function () {
        socket.emit("is-interface", currentView);
    });

    socket.on("robots-list", function (robots) {
        console.log("navigateur : socket on robot-list");
        selectRobots.innerHTML = "";
        if (robots != null && robots.length > 0) { // test that the number of detected robot in not null
            robots.forEach(function (robot) {
                addRobot(robot);
            });

            if (currentRobotId === null) {
                currentRobotId = robots[0];
            }
        } else {
            addRobot("Aucun robot disponible");
        }
    });
});