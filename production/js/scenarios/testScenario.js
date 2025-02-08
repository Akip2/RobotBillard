import {isRobotNear, moveRobotTo} from "../brain/brain.js";
import {getRobot} from "../elements-manager.js";
import {MIN_ORDER_DURATION} from "../brain/brain-parameters.js";

export function startTestScenario(socket, index) {
    let robotPosition = getRobot(0).position;

    moveRobotTo(socket, index, robotPosition.x, robotPosition.y + 100);

    let check = setInterval(() => {
        if (isRobotNear(index, robotPosition.x, robotPosition.y + 100, 5)) {
            moveRobotTo(socket, index, robotPosition.x, robotPosition.y - 100);
            clearInterval(check);
        }
    }, MIN_ORDER_DURATION);
}
