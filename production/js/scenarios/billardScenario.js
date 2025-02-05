import {getBalls, getRobot} from "../index.js";
import {moveRobotTo} from "../brain.js";


// méthode qui permet de lancer une simulation de partie de billard
// socket et la connexion qui permet de communiquer avec le robot
// index est d'index du robot à faire bouger (dans le tableau de robot)
export async function startBillardScenario(socket, index) {
    let balls = getBalls();
    let robot = getRobot(index);
    let ballToPush;

    while (!isEmpty(balls)) {
        balls = getBalls();
        robot = getRobot(index);
        ballToPush = getNearestBall(balls, robot.position);

        console.log(balls);
        console.log(ballToPush)

        moveRobotTo(socket, index, ballToPush.x, ballToPush.y);

        await sleep(100);
    }
}

function isEmpty(tab) {
    return tab.length === 0;
}

function getNearestBall(balls, robotPosition) {
    let nearestBall = balls[0];
    let minDistance = Math.abs(nearestBall.x - robotPosition.x) + Math.abs(nearestBall.y - robotPosition.y);

    for (let i = 1; i < balls.length; i++) {
        let distance = Math.abs(balls[i].x - robotPosition.x) + Math.abs(balls[i].y - robotPosition.y);
        if (distance < minDistance) {
            nearestBall = balls[i];
            minDistance = distance;
        }
    }

    return nearestBall;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
