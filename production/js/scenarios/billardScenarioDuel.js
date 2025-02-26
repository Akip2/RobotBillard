import {getAvailableRobots, getBalls, getRobot} from "../elements-manager.js";
import {BROADCAST, MIN_ORDER_DURATION} from "../brain/brain-parameters.js";
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
export async function startBillardScenarioDuel(socket, robotIp) {
    let balls = getBalls();
    let allRobots;
    let robot;

    while (isActive) {
        allRobots = currentRobotId === BROADCAST;
        balls = getBalls();

        if (allRobots) {
            for (let i = 0; i < getAvailableRobots().length - 1; i++) {
                console.log("i = " + i);
                robot = getRobot(i);
                console.log(robot);
                await moveRobot(socket, robotIp, robot);
            }
        } else {
            robot = getRobot(currentRobotId - 1);
            await moveRobot(socket, robotIp, robot);
        }
    }
}

async function moveRobot(socket, robotIp, robot) {
    let balls = getBalls();

    if (robot !== undefined) {
        let ballToPush = getNearestBall(balls, robot.position);

        if (ballToPush !== undefined) {
            moveRobotTo(socket, robotIp, ballToPush.x, ballToPush.y);
        }
    }
    await sleep(MIN_ORDER_DURATION);
}
