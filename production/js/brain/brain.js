import {simulatorSpeed} from "../events/parameters.js";
import {getHoles, getRobot, getRobotIp, getRobotsIds} from "../elements-manager.js";
import {
    ANGLE_THRESHOLD,
    BALL_REAL_SIZE,
    DISTANCE_THRESHOLD,
    FOV,
    HANDLING_COLLISION,
    MAX_DIST,
    MIN_ORDER_DURATION,
    ROBOT_MAX_SPEED,
    ROBOT_MIN_SPEED,
    TABLE_REAL_SIZE
} from "./brain-parameters.js";
import {isSimulator} from "../events/view-manager.js";
import {holeRadius} from "../../simulateur/params.js";
import {sleep} from "../scenarios/scenario-functions.js";

const intervals = new Map();

/**
 * Makes the robot face a specific point
 * @param socket the socketIO socket
 * @param robotId the targeted robot
 * @param x the x coordinate of the destination to face
 * @param y the y coordinate of the destination to face
 */
export function turnRobot(socket, robotId, x, y) {
    let direction;

    const robot = getRobot(robotId);
    const angleDifference = getAngleDifference(robot, x, y);
    angleDifference > 0 ? direction = "Left" : direction = "Right";

    let rotationSpeed = Math.abs(angleDifference) * 2;

    if (rotationSpeed > ROBOT_MAX_SPEED) {
        rotationSpeed = ROBOT_MAX_SPEED / 2;
    } else if (rotationSpeed < ROBOT_MIN_SPEED) {
        rotationSpeed = ROBOT_MIN_SPEED;
    }

    if (direction === "Left") {
        socket.emit('motor', createOrder(-rotationSpeed, rotationSpeed, MIN_ORDER_DURATION, getRobotIp(robotId)));
    } else {
        socket.emit('motor', createOrder(rotationSpeed, -rotationSpeed, MIN_ORDER_DURATION, getRobotIp(robotId)));
    }
}

export function isInTheWay(robot, x, y, lookFront = true) {
    const fov = FOV;
    const maxDist = MAX_DIST;

    const orientationRad = -(robot.orientation * Math.PI) / 180;

    let dirX = Math.cos(orientationRad);
    let dirY = Math.sin(orientationRad);

    if (!lookFront) {
        dirX = -dirX;
        dirY = -dirY;
    }

    const vecX = x - robot.position.x;
    const vecY = y - robot.position.y;

    const normVec = Math.sqrt(vecX ** 2 + vecY ** 2);

    if (normVec <= maxDist) { //Obstacle is too far anyway
        const dot = vecX * dirX + vecY * dirY;
        const normDir = Math.sqrt(dirX * dirX + dirY * dirY);

        const cosAlpha = dot / (normVec * normDir);
        return cosAlpha > Math.cos(fov);
    } else {
        console.log("obstacle is too far");
        return false;
    }
}

/**
 * Handles what to do in the event of a collision between 2 robots
 * @param socket
 * @param robotId
 * @returns {Promise<void>}
 */
export async function handleCollision(socket, robotId) {
    clearInterval(intervals.get(robotId));
    intervals.set(robotId, HANDLING_COLLISION);

    await sleep(300);

    intervals.set(robotId, null);
}

/**
 * Check if the specified robot has other robots in the way
 * @param robotId the specified robot
 * @param lookFront
 * @returns {boolean}
 */
export function areRobotsInTheWay(robotId, lookFront = true) {
    const robotsIds = getRobotsIds();
    const robot = getRobot(robotId);

    let inTheWay = false;
    for (let i = 0; i < robotsIds.length && !inTheWay; i++) {
        const id = robotsIds[i];

        if (id !== robotId) {
            const currentRobot = getRobot(id);
            const topLeft = currentRobot.corners[0];
            const topRight = currentRobot.corners[1];
            const bottomRight = currentRobot.corners[2];
            const bottomLeft = currentRobot.corners[3];

            if (currentRobot) {
                inTheWay = (
                    isInTheWay(robot, currentRobot.position.x, currentRobot.position.y, lookFront)
                    ||
                    isInTheWay(robot, topLeft.x, topLeft.y, lookFront)
                    ||
                    isInTheWay(robot, topRight.x, topRight.y, lookFront)
                    ||
                    isInTheWay(robot, bottomRight.x, bottomRight.y, lookFront)
                    ||
                    isInTheWay(robot, bottomLeft.x, bottomLeft.y, lookFront)
                );
            }
        }
    }

    return inTheWay;
}

/**
 * The main function used to tell a robot to go somewhere
 * @param socket the socketIO socket
 * @param robotId the targeted robot
 * @param x the x coordinate of the destination
 * @param y the y coordinate of the destination
 */
export function moveRobotTo(socket, robotId, x, y) {
    robotId = Number(robotId);
    let currentInterval = intervals.get(robotId);
    if (currentInterval === HANDLING_COLLISION) return;

    clearInterval(intervals.get(robotId));

    let direction = "Left";
    currentInterval = setInterval(async () => {
        let robot = getRobot(robotId);

        if (robot !== undefined) {
            let angleDifference = getAngleDifference(robot, x, y);
            angleDifference > 0 ? direction = "Left" : direction = "Right";

            let distanceDifference = distanceBetweenPoints(robot.position, {
                x: x,
                y: y
            });

            // Check if we arrived at destination or if the robot is near a hole
            // TODO : check values for the real robot (holeRadius * 5)
            let robotIsNearTargetHole = isRobotNearHole(robotId, holeRadius * 5) && isRobotNear(robotId, x, y, holeRadius * 5);

            if ((distanceDifference < DISTANCE_THRESHOLD) || robotIsNearTargetHole) {
                clearInterval(currentInterval);
            }

            const isTargetForward = (angleDifference <= ANGLE_THRESHOLD) && (angleDifference >= -ANGLE_THRESHOLD);
            const isTargetBackward = (angleDifference <= -180 + ANGLE_THRESHOLD) || (angleDifference >= 180 - ANGLE_THRESHOLD);

            if (isTargetForward) {
                if (areRobotsInTheWay(robotId)) {
                    await handleCollision(socket, robotId);
                } else {
                    socket.emit('motor', createOrder(ROBOT_MAX_SPEED, ROBOT_MAX_SPEED, MIN_ORDER_DURATION, getRobotIp(robotId)));
                }
            } else if (isTargetBackward) {
                if (areRobotsInTheWay(robotId, false)) {
                    await handleCollision(socket, robotId);
                } else {
                    socket.emit('motor', createOrder(-ROBOT_MAX_SPEED, -ROBOT_MAX_SPEED, MIN_ORDER_DURATION, getRobotIp(robotId)));
                }
            } else {
                // Tries to turn and go forward / backward smoothly
                const isTargetBehind = angleDifference > 90 || angleDifference < -90;

                let otherMotorSpeed = Math.abs(90 - Math.abs(angleDifference)) / 180 * ROBOT_MAX_SPEED;
                let fullSpeedMotor = ROBOT_MAX_SPEED;

                // Needs to turn before moving if too close to the target
                if (distanceDifference < DISTANCE_THRESHOLD * 2) {
                    turnRobot(socket, robotId, x, y);
                } else {
                    if (direction === "Left") {
                        if (isTargetBehind) {
                            if (areRobotsInTheWay(robotId, false))
                                await handleCollision(socket, robotId);
                            else
                                socket.emit('motor', createOrder(-otherMotorSpeed, -fullSpeedMotor, MIN_ORDER_DURATION, getRobotIp(robotId)));
                        } else {
                            if (areRobotsInTheWay(robotId))
                                await handleCollision(socket, robotId);
                            else
                                socket.emit('motor', createOrder(otherMotorSpeed, fullSpeedMotor, MIN_ORDER_DURATION, getRobotIp(robotId)));
                        }
                    } else {
                        if (isTargetBehind) {
                            if (areRobotsInTheWay(robotId, false))
                                await handleCollision(socket, robotId);
                            else
                                socket.emit('motor', createOrder(-fullSpeedMotor, -otherMotorSpeed, MIN_ORDER_DURATION, getRobotIp(robotId)));
                        } else {
                            if (areRobotsInTheWay(robotId))
                                await handleCollision(socket, robotId);
                            else
                                socket.emit('motor', createOrder(fullSpeedMotor, otherMotorSpeed, MIN_ORDER_DURATION, getRobotIp(robotId)));
                        }
                    }
                }
            }
        }
    }, (MIN_ORDER_DURATION / 2) / (isSimulator ? simulatorSpeed : 1));

    intervals.set(robotId, currentInterval);
}

/**
 * Stops every robot from doing their current script
 * @param socket the socketIO socket
 */
export function stopRobots(socket) {
    intervals.forEach(interval => {
        clearInterval(interval);
    });

    // Need to refresh the last order of the robots
    socket.emit('motor', createOrder(0, 0, 100, "Broadcast"));
}

/**
 * Returns the angle difference between the direction the robot is facing,
 * and the angle between the robot and the specified point,
 * used to know if the robot is facing a specific point
 * @param robot
 * @param x
 * @param y
 * @returns {number|boolean}
 */
export function getAngleDifference(robot, x, y) {
    if (robot !== undefined) {
        const robotPosition = robot.position;
        const robotAngle = robot.orientation;
        const baseAngle = Math.atan2(robotPosition.y - y, x - robotPosition.x) * (180 / Math.PI);
        const targetAngle = baseAngle < 0 ? baseAngle + 360 : baseAngle;

        let angleDifference = (targetAngle - robotAngle) + 360 % 360;

        if (angleDifference < -180) {
            angleDifference += 360;
        } else if (angleDifference > 180) {
            angleDifference -= 360;
        }
        return angleDifference;
    }
    return false;
}

/**
 * Check if the robot is facing a specific point
 * @param robotId the targeted robot
 * @param x x coordinate of the point
 * @param y y coordinate of the point
 * @returns {boolean}
 */
export function isRobotFacing(robotId, x, y) {
    const robot = getRobot(robotId);

    if (robot !== undefined) {
        let angleDifference = getAngleDifference(robot, x, y);

        return Math.abs(angleDifference) <= ANGLE_THRESHOLD;
    }
    return false;
}

/**
 * Check if the specified robot is near a specific point, the maximum distance
 * to be considered near the point is necessary
 * @param robotId the targeted robot
 * @param x the x coordinate of the point
 * @param y the y coordinate of the point
 * @param distanceMax maximum distance to the point
 * @returns {boolean}
 */
export function isRobotNear(robotId, x, y, distanceMax) {
    let robot = getRobot(robotId);

    if (robot !== undefined) {
        let robotPosition = robot.position;
        let distance = distanceBetweenPoints(robotPosition, {x: x, y: y});

        return distance < distanceMax;
    }
    return false;
}

/**
 * Check if the specified robot is near any hole, the maximum distance
 * to be considered near a hole is necessary
 * @param robotIp the targeted robot
 * @param distanceMax the maximum distance to a hole
 * @returns {boolean}
 */
export function isRobotNearHole(robotIp, distanceMax) {
    let robot = getRobot(robotIp);
    let holes = getHoles();

    if (robot !== undefined && holes !== undefined) {
        let robotPosition = robot.position;

        // Check for every hole if the robot is nearby
        for (let i = 0; i < holes.length; i++) {
            let distance = distanceBetweenPoints(holes[i], robotPosition);

            if (distance < distanceMax) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Calculates the distance between 2 points, in pixel
 * @param p1 javascript type point
 * @param p2 javascript type point
 * @returns {number}
 */
export function distanceBetweenPoints(p1, p2) {
    if (p1 !== undefined && p2 !== undefined) {
        return Math.sqrt(
            Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
        );
    }
}

/**
 * Determines the point in the middle of two points
 * @param p1 javascript type point
 * @param p2 javascript type point
 * @returns {cv.Point}
 */
export function middleOfPoints(p1, p2) {
    return new cv.Point(
        (p1.x + p2.x) / 2,
        (p1.y + p2.y) / 2
    );
}

/**
 * Used to convert an OpenCV point into a javascript object point
 * @param CVpoint OpenCV point
 * @returns {{x: *, y: *}}
 */
export function convertCVPointToMathPoint(CVpoint) {
    return {
        x: CVpoint[0],
        y: CVpoint[1]
    };
}

/**
 * Used to know the diameter of a ball according to the detected length
 * of the table, this is done with a dot product, because we know the size
 * of a real ball and the real table
 * @param tableLength length of the table, in pixel
 * @returns {number}
 */
export function calculateBallSize(tableLength) {
    return (tableLength * BALL_REAL_SIZE) / TABLE_REAL_SIZE;
}

/**
 * Used to send orders to robots, this is sent as a JSON
 * @param left power of left wheel
 * @param right power of right wheel
 * @param duration duration of the order, in milliseconds
 * @param ipRobot the IP address of the robot, something like ff:80f60f...
 * @returns {{left, right, duration, time: DOMHighResTimeStamp, ipRobot}}
 */
export function createOrder(left, right, duration, ipRobot) {
    return {
        left: left,
        right: right,
        duration: duration,
        time: performance.now(),
        ipRobot: ipRobot
    };
}
