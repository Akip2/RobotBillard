import {getBalls, getHoles, getRobot} from "../elements-manager.js";
import {MIN_ORDER_DURATION} from "../brain/brain-parameters.js";
import {getNearestBall, getNearestHole, normalize, sleep} from "./scenario-functions.js";
import {isRobotFacing, isRobotNear, moveRobotTo, turnRobot} from "../brain/brain.js";
import {isActive} from "../index.js";
import {FPS} from "../video/video-parameters.js";


export const robotsDest = new Map();

export let robotDestX;
export let robotDestY;
export let ballPush = {x: 0, y: 0};

const alpha = 60;

/**
 * méthode qui permet de lancer une simulation de partie de billard
 * socket et la connexion qui permet de communiquer avec le robot
 * index est d'index du robot à faire bouger (dans le tableau de robot)
 * @param socket
 * @param robotId
 * @returns {Promise<void>}
 */
export async function startBillardScenarioComplex(socket, robotId) {
    while (isActive/*!isEmpty(balls)*/) {
        await goBehindBall(socket, robotId);
        await turnToTarget(socket, robotId);
        await hitTarget(socket, robotId);
    }
}

export function cleanBillardComplex() {
    robotsDest.clear();
}

async function hitTarget(socket, robotId) {
    if (isActive) {
        moveRobotTo(socket, robotId, robotsDest.get(robotId).x, robotsDest.get(robotId).y);

        while (isActive && !isRobotNear(robotId, robotsDest.get(robotId).x, robotsDest.get(robotId).y, 20)) {
            await sleep(MIN_ORDER_DURATION);
            moveRobotTo(socket, robotId, robotsDest.get(robotId).x, robotsDest.get(robotId).y);
        }
    }
}

async function turnToTarget(socket, robotId) {
    if (isActive) {
        turnRobot(socket, robotId, robotsDest.get(robotId).x, robotsDest.get(robotId).y);
        while (isActive && !isRobotFacing(robotId, robotsDest.get(robotId).x, robotsDest.get(robotId).y)) {
            await sleep(MIN_ORDER_DURATION);
            turnRobot(socket, robotId, robotsDest.get(robotId).x, robotsDest.get(robotId).y);
        }
    }
}

/**
 *
 * @param socket
 * @param robotId
 * @returns {Promise<*>} ball chosen to push
 */
async function goBehindBall(socket, robotId) {
    if (isActive) {
        let balls = getBalls();
        let robot = getRobot(robotId);

        let ballToPush;
        if (robot !== undefined) {
            ballToPush = getNearestBall(balls, robot.position);

            if (ballToPush !== undefined) {
                let pointToGo = getPositionBehindBall(ballToPush);
                robotDestX = pointToGo.x;
                robotDestY = pointToGo.y;

                robotsDest.set(robotId, pointToGo);

                while (isActive && !isRobotNear(robotId, pointToGo.x, pointToGo.y, 30)) {
                    balls = getBalls();
                    robot = getRobot(robotId);

                    if (robot !== undefined) {
                        ballToPush = getNearestBall(balls, robot.position);

                        if (ballToPush !== undefined) {
                            pointToGo = getPositionBehindBall(ballToPush);
                            robotDestX = pointToGo.x;
                            robotDestY = pointToGo.y;

                            robotsDest.set(robotId, pointToGo);
                            ballPush = ballToPush;

                            moveRobotTo(socket, robotId, pointToGo.x, pointToGo.y);
                        }
                    }
                    await sleep(MIN_ORDER_DURATION);
                }

                if (ballToPush !== undefined) {
                    robotDestX = ballToPush.x;
                    robotDestY = ballToPush.y;

                    robotsDest.set(robotId, ballToPush);
                } else {
                    await goBehindBall(socket, robotId)
                }
            } else {
                await sleep(1000 / FPS); //Wait for next frame
                await goBehindBall(socket, robotId);
            }
        } else {
            await sleep(1000 / FPS); //Wait for next frame
            await goBehindBall(socket, robotId);
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
