import {moveRobotTo} from "../brain.js";
import {getRobot} from "../index.js";

export function startTestScenario(socket, index) {
    let robotPosition = getRobot(index).position;
    let targetPosition = {x: Math.round(robotPosition.x + 50), y: Math.round(robotPosition.y)};

    moveRobotTo(socket, index, targetPosition.x, targetPosition.y);


}