import {getBalls, getRobot, getRobotsIds} from "../elements-manager.js";
import {isActive} from "../index.js";
import {getNearestBall, sleep} from "./scenario-functions.js";
import {MIN_ORDER_DURATION} from "../brain/brain-parameters.js";
import {moveRobotTo} from "../brain/brain.js";
import {robotWidth} from "../../simulateur/params.js";

/**
 * méthode qui permet de lancer une simulation de partie de billard avec plusieurs robots en collaboration
 * @returns {Promise<void>}
 */
export async function startBillardScenarioCollaboration(socket) {
    while (isActive) {
        let balls = getBalls();
        let robotsIds = getRobotsIds();

        let assignedBalls = new Set(); // Pour éviter les doublons

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

        await sleep(MIN_ORDER_DURATION);
    }
}

// function isRobotInPath(robot, robots, x, y) {
//     let robotFound = true;
//
//     let availableRobots = removeRobot(robot, robots);
//
//     for (let id of availableRobots) {
//         let otherRobot = getRobot(id);
//         // TODO
//     }
//     return robotFound;
// }

function isRobotInPath(robot, robots, x, y) {
    for (let id of robots) {
        let otherRobot = getRobot(id);
        if (!otherRobot || otherRobot.id === robot.id) continue;

        let distance = Math.hypot(otherRobot.position.x - x, otherRobot.position.y - y);
        if (distance < robotWidth * 3) {  // Seuil de collision
            return true;
        }
    }
    return false;
}

function removeRobot(robot, robots) {
    let availableRobots = [];
    for (let r of robots) {
        if (r !== robot) {
            availableRobots.push(r);
        }
    }
    return availableRobots;
}
