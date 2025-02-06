import {currentView, table} from "./events/view-manager.js";
import {getRealRobot} from "./video/video.js";
import {getRealBalls} from "./video/video-functions.js";
import {selectRobots} from "./events/index-init.js";

export function getRobot(index) {
    if (currentView === "simulator") {
        let angle = table.robots[index].body.angle;

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

export function addRobot(robotName) {
    let option = document.createElement("option");
    option.text = robotName;
    selectRobots.appendChild(option);
}
