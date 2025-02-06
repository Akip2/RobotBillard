// Billard configurations
import {currentRobotId, setCurrentRobotId} from "./events/parameters.js";
import {currentView, init, table} from "./events/view-manager.js";
import {selectRobots} from "./events/index-init.js";
import {addRobot} from "./elements-manager.js";

export const socket = io(); // Connection to server

document.addEventListener("DOMContentLoaded", () => {
    init();
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
        } else {
            addRobot("Aucun robot disponible");
        }
    });
});