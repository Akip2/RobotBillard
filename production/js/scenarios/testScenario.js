import {isRobotNear, moveRobotTo} from "../brain/brain.js";
import {getRobot} from "../elements-manager.js";
import {MIN_ORDER_DURATION} from "../brain/brain-parameters.js";

export function startTestScenario(socket, robotIp) {
    let robotPosition = getRobot(0).position;

    moveRobotTo(socket, robotIp, robotPosition.x, robotPosition.y + 100);

    let check = setInterval(() => {
        if (isRobotNear(robotIp, robotPosition.x, robotPosition.y + 100, 5)) {
            moveRobotTo(socket, robotIp, robotPosition.x, robotPosition.y - 100);
            clearInterval(check);
        }
    }, MIN_ORDER_DURATION);
}
