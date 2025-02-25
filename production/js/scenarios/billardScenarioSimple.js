import {getBalls, getRobot} from "../elements-manager.js";
import {moveRobotTo} from "../brain/brain.js";
import {MIN_ORDER_DURATION} from "../brain/brain-parameters.js";
import {getNearestBall, sleep} from "./scenario-functions.js";
import {isActive} from "../index.js";
import {currentRobotId} from "../events/parameters.js";

/**
 * méthode qui permet de lancer une simulation de partie de billard
 * socket et la connexion qui permet de communiquer avec le robot
 * index est d'index du robot à faire bouger (dans le tableau de robot)
 * @param socket
 * @param robotIp
 * @returns {Promise<void>}
 */
export async function startBillardScenarioSimple(socket, robotIp) {
    let balls = getBalls();
    let robot = getRobot(currentRobotId - 1);
    let ballToPush;

    while (isActive) {
        balls = getBalls();
        robot = getRobot(currentRobotId - 1);

        if (robot !== undefined) {
            ballToPush = getNearestBall(balls, robot.position);

            if (ballToPush !== undefined) {
                moveRobotTo(socket, robotIp, ballToPush.x, ballToPush.y);
            }
        }
        await sleep(MIN_ORDER_DURATION);
    }
}
