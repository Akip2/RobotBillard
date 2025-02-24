import {isRobotNear, moveRobotTo} from "../brain/brain.js";
import {getRobot} from "../elements-manager.js";
import {sleep} from "./scenario-functions.js";
import {MIN_ORDER_DURATION} from "../brain/brain-parameters.js";
import {isActive} from "../index.js";

export async function startTestScenario(socket, robotIp) {
    let startRobotPosition = getRobot(0).position;
    let robot = getRobot(0);


    // Go to the right
    while (isActive && !isRobotNear(robotIp, startRobotPosition.x + 100, startRobotPosition.y, 10)) {
        robot = getRobot(0);

        if (robot !== undefined) {
            moveRobotTo(socket, robotIp, startRobotPosition.x + 100, startRobotPosition.y);
        }
        await sleep(MIN_ORDER_DURATION);
    }

    // Go down
    while (isActive && !isRobotNear(robotIp, startRobotPosition.x + 100, startRobotPosition.y + 50, 10)) {
        robot = getRobot(0);

        if (robot !== undefined) {
            moveRobotTo(socket, robotIp, startRobotPosition.x + 100, startRobotPosition.y + 50);
        }
        await sleep(MIN_ORDER_DURATION);
    }

    // Go left
    while (isActive && !isRobotNear(robotIp, startRobotPosition.x, startRobotPosition.y + 50, 10)) {
        robot = getRobot(0);

        if (robot !== undefined) {
            moveRobotTo(socket, robotIp, startRobotPosition.x, startRobotPosition.y + 50);
        }
        await sleep(MIN_ORDER_DURATION);
    }

    // Go up
    while (isActive && !isRobotNear(robotIp, startRobotPosition.x, startRobotPosition.y, 10)) {
        robot = getRobot(0);

        if (robot !== undefined) {
            moveRobotTo(socket, robotIp, startRobotPosition.x, startRobotPosition.y);
        }
        await sleep(MIN_ORDER_DURATION);
    }
}
