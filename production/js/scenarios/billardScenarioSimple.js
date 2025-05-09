import {getBalls, getRobot} from "../elements-manager.js";
import {moveRobotTo} from "../brain/brain.js";
import {MIN_ORDER_DURATION} from "../brain/brain-parameters.js";
import {getNearestBall, sleep} from "./scenario-functions.js";
import {isActive} from "../index.js";

/**
 * méthode qui permet de lancer une simulation de partie de billard
 * socket et la connexion qui permet de communiquer avec le robot
 * index est d'index du robot à faire bouger (dans le tableau de robot)
 * @param socket
 * @param robotId
 * @returns {Promise<void>}
 */
export async function startBillardScenarioSimple(socket, robotId) {
    let balls = getBalls();
    let robot = getRobot(robotId);
    let ballToPush;

    while (isActive) {
        balls = getBalls();
        robot = getRobot(robotId);

        if (robot !== undefined) {
            ballToPush = getNearestBall(balls, robot.position);

            if (ballToPush !== undefined) {
                moveRobotTo(socket, robotId, ballToPush.x, ballToPush.y);
            }
        }
        await sleep(MIN_ORDER_DURATION);
    }
}
