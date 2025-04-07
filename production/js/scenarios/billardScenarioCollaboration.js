import {getBalls, getRobot, getRobotsIds} from "../elements-manager.js";
import {isActive} from "../index.js";
import {getNearestBall, sleep} from "./scenario-functions.js";
import {MIN_ORDER_DURATION} from "../brain/brain-parameters.js";
import {distanceBetweenPoints, moveRobotTo} from "../brain/brain.js";

/**
 * Méthode qui permet de lancer une simulation de partie de billard avec plusieurs robots en collaboration
 * @returns {Promise<void>}
 */
export async function startBillardScenarioCollaboration(socket) {
    while (isActive) {
        let balls = getBalls();
        let robotsIds = getRobotsIds().sort();

        let assignedBalls = new Set(); // Pour éviter les doublons

        // if there is only one ball to push
        if (balls.length === 1) {
            let ballToPush = balls[0];
            let nearestRobot = getRobot(getRobotsIds()[0]);
            let nearestRobotId = getRobotsIds()[0];

            for (let id of robotsIds) {
                let currentRobot = getRobot(id);
                if (nearestRobot !== currentRobot) {
                    if (distanceBetweenPoints(currentRobot.position, ballToPush) < distanceBetweenPoints(nearestRobot.position, ballToPush)) {
                        nearestRobot = currentRobot;
                        nearestRobotId = id;
                    }
                }
            }
            moveRobotTo(socket, nearestRobotId, ballToPush.x, ballToPush.y);
        } else {
            for (let id of robotsIds) {
                let robot = getRobot(id);
                if (!robot) continue;

                // Trouver la boule la plus proche non attribuée
                let availableBalls = [];

                for (let b of balls) {
                    if (!assignedBalls.has(b)) {
                        availableBalls.push(b);
                    }
                }

                let ballToPush = getNearestBall(availableBalls, robot.position);
                if (!ballToPush) continue; // Si plus de boules disponibles, on arrête
                assignedBalls.add(ballToPush); // Marquer la boule comme prise
                moveRobotTo(socket, id, ballToPush.x, ballToPush.y);
            }
        }


        await sleep(MIN_ORDER_DURATION);
    }
}
