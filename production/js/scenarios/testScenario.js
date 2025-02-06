import {isRobotNear, moveRobotTo} from "../brain.js";
import {getRobot} from "../elements-manager.js";

export function startTestScenario(socket, index) {
    let robotPosition = getRobot(0).position;

    moveRobotTo(socket, index, robotPosition.x, robotPosition.y + 100);

    let check = setInterval(() => {
        if (isRobotNear(index, robotPosition.x, robotPosition.y + 100, 20)) {
            moveRobotTo(socket, index, robotPosition.x, robotPosition.y - 100);
            clearInterval(check);
        }
    }, 100);
}
