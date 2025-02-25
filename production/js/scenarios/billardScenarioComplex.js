import {getBalls, getHoles, getRobot} from "../elements-manager.js";
import {MIN_ORDER_DURATION} from "../brain/brain-parameters.js";
import {getNearestBall, getNearestHole, normalize, sleep} from "./scenario-functions.js";
import {isRobotFacing, isRobotNear, moveRobotTo, turnRobot} from "../brain/brain.js";
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

        const alpha = 60;
        
        if (robot !== undefined) {
            const ballToPush = getNearestBall(balls, robot.position);
            const hole = getNearestHole(holes, ballToPush)

            if (ballToPush !== undefined) {
                const pushVector = {
                    x: hole.x - ballToPush.x,
                    y: hole.y - ballToPush.y,
                }

                const normalizedPushVector = normalize(pushVector);

                // Calculate position behind the ball
                let robotX = ballToPush.x - alpha * normalizedPushVector.x;
                let robotY = ballToPush.y - alpha * normalizedPushVector.y;

                while(isActive && !isRobotNear(robotIp, robotX, robotY, 10)) {
                    robot = getRobot(0);

                    if (robot !== undefined) {
                        moveRobotTo(socket, robotIp, robotX, robotY);
                    }
                    await sleep(MIN_ORDER_DURATION);
                }
                if(!isActive) {
                    break;
                }

                turnRobot(socket, robotIp, ballToPush.x, ballToPush.y);
                while(isActive && !isRobotFacing(robotIp, ballToPush.x, ballToPush.y)){
                    await sleep(MIN_ORDER_DURATION);
                }

                await sleep(750);
                if(!isActive) {
                    break;
                }

                robotX = ballToPush.x;
                robotY = ballToPush.y;
                while(isActive && !isRobotNear(robotIp, robotX, robotY, 40)) {
                    robot = getRobot(0);

                    if (robot !== undefined) {
                        moveRobotTo(socket, robotIp, robotX, robotY);
                    }
                    await sleep(MIN_ORDER_DURATION);
                }
            }
        }
        await sleep(MIN_ORDER_DURATION);
    }
}
