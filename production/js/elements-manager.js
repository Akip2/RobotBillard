import {currentView, table} from "./events/view-manager.js";
import {getRealRobot} from "./video/video.js";
import {getRealBalls, getRealHoles} from "./video/video-functions.js";
import {selectRobots, selectRobotsSim} from "./index.js";

export function getRobot(index) {
    if (currentView === "simulator") {
        let angle = table.robots[index].body.angle;

        // Matter.js angle range from -infinity to +infinity
        // we convert them to be between -180 to 180
        if (angle > 0) {
            angle = 360 - ((Math.abs(table.robots[index].body.angle) * (180 / Math.PI)) % 360);
        } else {
            angle = (Math.abs(table.robots[index].body.angle) * (180 / Math.PI)) % 360;
        }

        return {
            position:
                {
                    x: table.robots[index].body.position.x,
                    y: table.robots[index].body.position.y
                },
            orientation: angle
        };
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
    option.text = robotName;

    if (currentView === "simulator") {
        selectRobotsSim.appendChild(option);
    } else {
        selectRobots.appendChild(option);
    }
}
