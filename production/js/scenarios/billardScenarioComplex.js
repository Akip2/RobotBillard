import {getBalls, getHoles, getRobot} from "../elements-manager.js";
import {MIN_ORDER_DURATION} from "../brain/brain-parameters.js";
import {getNearestBall, sleep} from "./scenario-functions.js";
import {moveRobotTo} from "../brain/brain.js";
import {isActive} from "../index.js";


/**
 * méthode qui permet de lancer une simulation de partie de billard
 * socket et la connexion qui permet de communiquer avec le robot
 * index est d'index du robot à faire bouger (dans le tableau de robot)
 * @param socket
 * @param robotIp
 * @returns {Promise<void>}
 */
export async function startBillardScenarioComplex(socket, robotIp) {
    let balls = getBalls();
    let holes = getHoles();
    let robot = getRobot(0);
    let ballToPush;

    // TODO btn stop
    while (isActive/*!isEmpty(balls)*/) {
        balls = getBalls();
        holes = getHoles();
        robot = getRobot(0);

        if (robot !== undefined) {
            ballToPush = getNearestBall(balls, robot.position);

            // getNearestHole();
            console.log(holes);
            console.log()

            if (ballToPush !== undefined) {
                moveRobotTo(socket, robotIp, ballToPush.x, ballToPush.y);
            }
        }
        await sleep(MIN_ORDER_DURATION);
    }
}
