import {getBalls, getRobot} from "../elements-manager.js";
import {distanceBetweenPoints, moveRobotTo} from "../brain.js";
import {getRealHoles} from "../video/video-functions.js";

/**
 * méthode qui permet de lancer une simulation de partie de billard
 * socket et la connexion qui permet de communiquer avec le robot
 * index est d'index du robot à faire bouger (dans le tableau de robot)
 * @param socket
 * @param index
 * @returns {Promise<void>}
 */
export async function startBillardScenario(socket, index) {
    let balls = getBalls();
    // let holes = getHoles();
    let robot = getRobot(index);
    let ballToPush;

    while (!isEmpty(balls)) {
        balls = getBalls();
        // holes = getHoles();
        robot = getRobot(index);

        if (robot !== undefined) {
            ballToPush = getNearestBall(balls, robot.position);

            // getNearestHole();

            if (ballToPush !== undefined) {
                moveRobotTo(socket, index, ballToPush.x, ballToPush.y);
            }
        }

        await sleep(100);
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isEmpty(tab) {
    return tab.length === 0;
}
