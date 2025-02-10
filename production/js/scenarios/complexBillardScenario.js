import {getBalls, getRobot} from "../elements-manager.js";
import {distanceBetweenPoints, moveRobotTo} from "../brain/brain.js";
import {getRealHoles} from "../video/video-functions.js";
import {MIN_ORDER_DURATION} from "../brain/brain-parameters.js";
import {isEmpty, sleep} from "./scenario-functions.js";


/**
 * méthode qui permet de lancer une simulation de partie de billard
 * socket et la connexion qui permet de communiquer avec le robot
 * index est d'index du robot à faire bouger (dans le tableau de robot)
 * @param socket
 * @param robotIp
 * @returns {Promise<void>}
 */
export async function startComplexBillardScenario(socket, robotIp) {
    let balls = getBalls();
    // let holes = getHoles();
    let robot = getRobot(0);
    let ballToPush;

    while (!isEmpty(balls)) {
        balls = getBalls();
        // holes = getHoles();
        robot = getRobot(0);

        if (robot !== undefined) {
            ballToPush = getNearestBall(balls, robot.position);

            // getNearestHole();

            if (ballToPush !== undefined) {
                moveRobotTo(socket, robotIp, ballToPush.x, ballToPush.y);
            }
        }
        await sleep(MIN_ORDER_DURATION);
    }
}

function getNearestBall(balls, robotPosition) {
    let nearestBall = balls[0];
    let minDistance = distanceBetweenPoints(nearestBall, robotPosition);

    for (let i = 1; i < balls.length; i++) {
        let distance = distanceBetweenPoints(balls[i], robotPosition);

        if (distance < minDistance) {
            nearestBall = balls[i];
            minDistance = distance;
        }
    }
    return nearestBall;
}

function getNearestHole(holes, ball) {
    let nearestHole = holes[0];
    let minDistance = distanceBetweenPoints(nearestHole, ball);

    for (let i = 1; i < holes.length; i++) {
        let distance = distanceBetweenPoints(holes[i], ball);

        if (distance < minDistance) {
            nearestHole = holes[i];
            minDistance = distance;
        }
    }
    return nearestHole;
}

function getAlignPositionToPush(ballToPush) {
    let holes = getRealHoles();

    console.log(holes);

}
