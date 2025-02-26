import {getBalls, getHoles, getRobot} from "../elements-manager.js";
import {MIN_ORDER_DURATION} from "../brain/brain-parameters.js";
import {getNearestBall, getNearestHole, normalize, sleep} from "./scenario-functions.js";
import {isRobotFacing, isRobotNear, moveRobotsTo, turnRobots} from "../brain/brain.js";
import {isActive} from "../index.js";
import {FPS} from "../video/video-parameters.js";

export let robotDestX;
export let robotDestY;
export let ballPush = {x: 0, y: 0};

const useClosestBallToRobot = true;

const alpha = 60;

/**
 * méthode qui permet de lancer une simulation de partie de billard
 * socket et la connexion qui permet de communiquer avec le robot
 * index est d'index du robot à faire bouger (dans le tableau de robot)
 * @param socket
 * @param robotIp
 * @returns {Promise<void>}
 */
export async function startBillardScenarioComplex(socket, robotIp) {
    while (isActive/*!isEmpty(balls)*/) {
        await goBehindBall(socket, robotIp);
        await turnToTarget(socket, robotIp);
        await hitTarget(socket, robotIp);
    }
}

async function hitTarget(socket, robotIp) {
    if (isActive) {
        moveRobotsTo(socket, robotIp, robotDestX, robotDestY);
        await sleep(1000);
        //socket.emit('motor', createOrder(ROBOT_MAX_SPEED, ROBOT_MAX_SPEED, 500, robotIp));
        //await sleep(500);
    }
}

async function turnToTarget(socket, robotIp) {
    if (isActive) {
        turnRobots(socket, robotIp, robotDestX, robotDestY);
        while (isActive && !isRobotFacing(robotIp, robotDestX, robotDestY)) {
            await sleep(MIN_ORDER_DURATION);
        }
    }
}

/**
 *
 * @param socket
 * @param robotIp
 * @returns {Promise<*>} ball chosen to push
 */
async function goBehindBall(socket, robotIp) {
    if (isActive) {
        let balls = getBalls();
        let robot = getRobot(0);

        let ballToPush, hole;
        if (robot !== undefined) {
            ballToPush = getNearestBall(balls, robot.position);

            if (ballToPush !== undefined) {
                let pointToGo = getPositionBehindBall(ballToPush);
                robotDestX = pointToGo.x;
                robotDestY = pointToGo.y;

                while (isActive && !isRobotNear(robotIp, robotDestX, robotDestY, 30)) {
                    balls = getBalls();
                    robot = getRobot(0);

                    if (robot !== undefined) {
                        ballToPush = getNearestBall(balls, robot.position);

                        if (ballToPush !== undefined) {
                            pointToGo = getPositionBehindBall(ballToPush);
                            robotDestX = pointToGo.x;
                            robotDestY = pointToGo.y;

                            moveRobotsTo(socket, robotIp, robotDestX, robotDestY);
                        }
                    }
                    await sleep(MIN_ORDER_DURATION);
                }

                robotDestX = ballToPush.x;
                robotDestY = ballToPush.y;
            }
        } else {
            await sleep(1000 / FPS); //Wait for next frame
            await goBehindBall(socket, robotIp);
        }
    }
}

function getPositionBehindBall(ballToPush) {
    const holes = getHoles();
    const hole = getNearestHole(holes, ballToPush);

    const pushVector = {
        x: hole.x - ballToPush.x,
        y: hole.y - ballToPush.y,
    }

    const normalizedPushVector = normalize(pushVector);

    // Calculate position behind the ball
    return {
        x: ballToPush.x - alpha * normalizedPushVector.x,
        y: ballToPush.y - alpha * normalizedPushVector.y,
    };
}