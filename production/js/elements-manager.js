import {currentView, table} from "./events/view-manager.js";
import {getRealRobot} from "./video/video.js";
import {getRealBalls, getRealHoles} from "./video/video-functions.js";
import {selectRobots, selectRobotsSim} from "./index.js";

export function getRobot(index) {
    if (currentView === "simulator") {
        let robot = table.getRobotsDetected()[index];

        if (robot !== undefined) {
            return robot;
        }
    }
    return getRealRobot(index);
}

export function getAvailableRobots() {
    let robotList = [];

    if (currentView === "simulator") {
        for (let option of selectRobotsSim.options) {
            if (option.text === "Broadcast") {
                robotList.push(option.text);
            } else {
                robotList.push(option.text[option.text.length - 1]);
            }
        }
    } else {
        for (let option of selectRobots.options) {
            robotList.push(option.text);
        }
    }
    return robotList;
}

export function getBalls() {
    if (currentView === "simulator") {
        let balls = [];

        for (const ball of table.getBallsDetected()) {
            balls.push({
                x: ball.x,
                y: ball.y
            });
        }
        return balls;
    }
    return getRealBalls();
}

export function getHoles() {
    if (currentView === "simulator") {
        let holes = [];

        for (const hole of table.getHoles()) {
            holes.push({
                x: hole.body.position.x,
                y: hole.body.position.y
            });
        }
        return holes;
    }
    return getRealHoles();
}

export function addRobot(robotName) {
    let option = document.createElement("option");
    option.className = "option";
    option.text = robotName;

    if (currentView === "simulator") {
        selectRobotsSim.appendChild(option);
    } else {
        selectRobots.appendChild(option);
    }
}
