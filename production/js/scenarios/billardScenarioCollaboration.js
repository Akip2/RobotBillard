import {getBalls, getRobot, getRobotsIps} from "../elements-manager.js";
import {isActive} from "../index.js";
import {getNearestBall, sleep} from "./scenario-functions.js";
import {MIN_ORDER_DURATION} from "../brain/brain-parameters.js";
import {moveRobotTo} from "../brain/brain.js";

/**
 * méthode qui permet de lancer une simulation de partie de billard avec plusieurs robots en collaboration
 * @returns {Promise<void>}
 */
export async function startBillardScenarioCollaboration(socket) {
    while (isActive) {
        let balls = getBalls();
        let robotsIps = getRobotsIps();
        let assignedBalls = new Set(); // Pour éviter les doublons

        for (let [index, ip] of robotsIps.entries()) {
            let robot = getRobot(index + 1); // Récupération du robot correspondant
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
            moveRobotTo(socket, ip, ballToPush.x, ballToPush.y);
        }

        await sleep(MIN_ORDER_DURATION);
    }
}
