// Billard configurations
import {currentConfig, currentRobotId, currentScenario, initParams, setCurrentRobotId} from "./events/parameters.js";
import {currentView, initView, loadSimulator, table} from "./events/view-manager.js";
import {addRobot, isInsideTable} from "./elements-manager.js";
import {initControls} from "./events/controls.js";
import {startBillardScenarioSimple} from "./scenarios/billardScenarioSimple.js";
import {startTestScenario} from "./scenarios/testScenario.js";
import {moveRobotTo, stopRobots} from "./brain/brain.js";
import {startBillardScenarioComplex} from "./scenarios/billardScenarioComplex.js";
import {startBillardScenarioDuel} from "./scenarios/billardScenarioDuel.js";

export const socket = io(); // Connection to server

// loader
const loader = document.querySelector("#loader-container");

export const reload = document.querySelector("#reload-btn");
export const canvasContainer = document.querySelector("#canvas-container");

// viewGoScenarios
export const selectRobots = document.querySelector("#select-robot");
export const selectRobotsSim = document.querySelector("#select-robot-sim");
const goBtn = document.querySelector("#go-btn");

export let isActive = false;

document.addEventListener("DOMContentLoaded", () => {
    initView();
    initControls();
    initParams();

    goBtn.addEventListener("click", (event) => {
        isActive = !isActive;

        if (isActive) {
            goBtn.textContent = "STOP";
            goBtn.style.backgroundColor = "#FF99CC";

            //Starting scenario
            switch (currentScenario) {
                case "SimpleBillard":
                    startBillardScenarioSimple(socket, currentRobotId);
                    break;
                case "ComplexBillard":
                    startBillardScenarioComplex(socket, currentRobotId);
                    break;
                case "DuelBillard":
                    startBillardScenarioDuel(socket, currentRobotId);
                    break;
                case "default":
                    startTestScenario(socket, currentRobotId);
                    break;
            }
        } else {
            goBtn.textContent = "GO";
            goBtn.style.backgroundColor = "#99FFCC";
            stopRobots(socket);
        }
    });

    // Reload the simulation
    reload.addEventListener("click", () => {
        loadSimulator(currentConfig, currentRobotId);
    });

    canvasContainer.addEventListener("click", (event) => {
        let simulatorCanvas = document.querySelector("#canvas-simulateur");
        let isSimulator = simulatorCanvas ? !simulatorCanvas.classList.contains("displayNone") : false;

        let x = event.offsetX;
        let y = event.offsetY;

        console.log(isInsideTable(x, y));

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
        if (currentView !== "simulator") {
            console.log("navigateur : socket on robot-list");

            selectRobots.innerHTML = "";

            if (robots != null && robots.length > 0) { // test that the number of detected robot in not null
                let foundCurrentRobot = false;

                robots.forEach(function (robot) {
                    addRobot(robot);

                    if (robot === currentRobotId) {
                        foundCurrentRobot = true;
                    }
                });

                addRobot("Broadcast");

                if ((currentRobotId === null) || !foundCurrentRobot) {
                    console.log(selectRobots[selectRobots.childElementCount - 1].text)
                    setCurrentRobotId(selectRobots[selectRobots.childElementCount - 1].text);
                }
            } else {
                addRobot("Aucun robot disponible");
            }
        }
    });
});