import {getBalls, getHoles, getRobot} from "../elements-manager.js";
import {MIN_ORDER_DURATION, ROBOT_MAX_SPEED} from "../brain/brain-parameters.js";
import {getNearestBallToHoles, normalize, sleep} from "./scenario-functions.js";
import {createOrder, isRobotFacing, isRobotNear, moveRobotTo, turnRobot} from "../brain/brain.js";
import {isActive} from "../index.js";

export let robotDestX;
export let robotDestY;
export let ballPush = {x: 0, y: 0};

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
            let [ballToPush, hole] = getNearestBallToHoles(holes, balls);
            //const hole = getNearestHole(holes, ballToPush)

            if (ballToPush !== undefined) {
                let pushVector = {
                    x: hole.x - ballToPush.x,
                    y: hole.y - ballToPush.y,
                }

                let normalizedPushVector = normalize(pushVector);

                // Calculate position behind the ball
                robotDestX = ballToPush.x - alpha * normalizedPushVector.x;
                robotDestY = ballToPush.y - alpha * normalizedPushVector.y;
                ballPush = ballToPush;

                while (isActive && !isRobotNear(robotIp, robotDestX, robotDestY, 30)) {
                    robot = getRobot(0);

                    let [ballToPush, hole] = getNearestBallToHoles(holes, balls);
                    if (robot !== undefined && ballToPush !== undefined) {
                        pushVector = {
                            x: hole.x - ballToPush.x,
                            y: hole.y - ballToPush.y,
                        }
                        let normalizedPushVector = normalize(pushVector);

                        robotDestX = ballToPush.x - alpha * normalizedPushVector.x;
                        robotDestY = ballToPush.y - alpha * normalizedPushVector.y;

                        moveRobotTo(socket, robotIp, robotDestX, robotDestY);
                    }
                    await sleep(MIN_ORDER_DURATION);
                }
                if (!isActive) {
                    break;
                }

                turnRobot(socket, robotIp, ballToPush.x, ballToPush.y);
                while (isActive && !isRobotFacing(robotIp, ballToPush.x, ballToPush.y)) {
                    await sleep(MIN_ORDER_DURATION);
                }

                if (!isActive) {
                    break;
                }

                robotDestX = ballToPush.x;
                robotDestY = ballToPush.y;
                while (isActive && !isRobotNear(robotIp, robotDestX, robotDestY, 40)) {
                    robot = getRobot(0);

                    if (robot !== undefined) {
                        //moveRobotTo(socket, robotIp, robotX, robotY);
                        socket.emit('motor', createOrder(ROBOT_MAX_SPEED, ROBOT_MAX_SPEED, 500, robotIp));
                    }
                    await sleep(MIN_ORDER_DURATION);
                }
            }
        }
        await sleep(MIN_ORDER_DURATION);
    }
}
