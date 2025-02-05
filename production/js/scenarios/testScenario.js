import {isRobotNear, moveRobotTo} from "../brain.js";
import {getRobot} from "../index.js";

export function startTestScenario(socket, index) {
    let robotPosition = getRobot(0).position;

    moveRobotTo(socket, index, robotPosition.x + 100, robotPosition.y);

    let check = setInterval(() => {
        if (isRobotNear(index, robotPosition.x + 100, robotPosition.y, 20)) {
            moveRobotTo(socket, index, robotPosition.x - 50, robotPosition.y);
            clearInterval(check);
        }
    }, 100);
}