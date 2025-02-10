// Billard configurations
import {currentConfig, currentRobotId, currentScenario, initParams, setCurrentRobotId} from "./events/parameters.js";
import {currentView, initView, loadSimulator, table} from "./events/view-manager.js";
import {addRobot} from "./elements-manager.js";
import {initControls} from "./events/controls.js";
import {startBillardScenario} from "./scenarios/billardScenarioSimple.js";
import {startTestScenario} from "./scenarios/testScenario.js";
import {moveRobotTo} from "./brain.js";

export const socket = io(); // Connection to server

// loader
const loader = document.querySelector("#loader-container");

export const reload = document.querySelector("#reload-btn");
export const canvasContainer = document.querySelector("#canvas-container");

// viewGoScenarios
export const selectRobots = document.querySelector("#select-robot");
const goBtn = document.querySelector("#go-btn");

document.addEventListener("DOMContentLoaded", () => {
    initView();
    initControls();
    initParams();

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

    // Loader
    setTimeout(() => {
        loader.style.display = "none";
    }, 1500);
});

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
                setCurrentRobotId(robots[0])
            }
            addRobot("Broadcast");
        } else {
            addRobot("Aucun robot disponible");
        }
    });
});