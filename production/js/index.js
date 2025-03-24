// Billard configurations
import {currentConfig, currentRobotId, currentScenario, initParams, setCurrentRobotId} from "./events/parameters.js";
import {currentView, initView, loadSimulator, table} from "./events/view-manager.js";
import {addRobot, getRobotsIps} from "./elements-manager.js";
import {initControls} from "./events/controls.js";
import {startBillardScenarioSimple} from "./scenarios/billardScenarioSimple.js";
import {startTestScenario} from "./scenarios/testScenario.js";
import {moveRobotTo, stopRobots} from "./brain/brain.js";
import {startBillardScenarioComplex} from "./scenarios/billardScenarioComplex.js";
import {startBillardScenarioDuel} from "./scenarios/billardScenarioDuel.js";
import {BROADCAST} from "./brain/brain-parameters.js";

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

            let ids;
            //Starting scenario
            if(currentRobotId === BROADCAST) {
                ids = getRobotsIps();
            } else {
                ids = [currentRobotId];
            }

            switch (currentScenario) {
                case "SimpleBillard":
                    ids.forEach(id => {
                        startBillardScenarioSimple(socket, id);
                    })
                    break;
                case "ComplexBillard":
                    ids.forEach(id => {
                        startBillardScenarioComplex(socket, id);
                    })
                    break;
                case "DuelBillard":
                    ids.forEach(id => {
                        startBillardScenarioDuel(socket, id);
                    })
                    break;
                case "default":
                    ids.forEach(id => {
                        startTestScenario(socket, id);
                    })
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

        if (isSimulator) {
            // Get the position of a click on the simulator
            if(currentRobotId === BROADCAST) {
                const ips = getRobotsIps();

                ips.forEach(ip => {
                    moveRobotTo(socket, ip, x, y);
                });
            } else {
                moveRobotTo(socket, currentRobotId, x, y);
            }
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
    socket.emit("identification", {
        type: "interface"
    });

    socket.on("motor", function (order) {
        table.sendRobotOrder(order, order.ipRobot); // Send order to simulator
    });

    /*
    socket.on("ask-identity", function () {
        socket.emit("is-interface", currentView);
    });
     */

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