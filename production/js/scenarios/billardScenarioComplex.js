import {getBalls, getHoles, getRobot} from "../elements-manager.js";
import {MIN_ORDER_DURATION} from "../brain/brain-parameters.js";
import {getNearestBall, getNearestBallToHoles, sleep} from "./scenario-functions.js";
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

    while (isActive/*!isEmpty(balls)*/) {
        balls = getBalls();
        holes = getHoles();
        robot = getRobot(0);

        const alpha = 10;
        
        if (robot !== undefined) {
            const [ballToPush, hole] = getNearestBallToHoles(holes, balls);

            if (ballToPush !== undefined) {
                const pushVector = {
                    x: ballToPush.x - hole.x,
                    y: ballToPush.y - hole.y,
                }

                
                const robotX = ballToPush.x - alpha*pushVector.x;
                const robotY = ballToPush.y - alpha*pushVector.y;

                moveRobotTo(socket, robotIp, robotX, robotY);
                //await sleep(1000);
                //moveRobotTo(socket, robotIp, hole.x, hole.y);
            }
        }
        await sleep(MIN_ORDER_DURATION);
    }
}
