import {simulatorSpeed} from "../events/parameters.js";
import {getRobot, getRobotIp} from "../elements-manager.js";
import {
    ANGLE_THRESHOLD,
    BALL_REAL_SIZE,
    DISTANCE_THRESHOLD,
    MIN_ORDER_DURATION,
    ROBOT_MAX_SPEED,
    ROBOT_MIN_SPEED,
    TABLE_REAL_SIZE
} from "./brain-parameters.js";
import {isSimulator} from "../events/view-manager.js";

const intervals = new Map();

export function turnRobot(socket, robotId, x, y) {
    let direction;

    const robot = getRobot(robotId);
    const angleDifference = getAngleDifference(robot, x, y);
    angleDifference > 0 ? direction = "Left" : direction = "Right";

    let rotationSpeed = Math.abs(angleDifference) * 2;

    if (rotationSpeed > ROBOT_MAX_SPEED) {
        rotationSpeed = ROBOT_MAX_SPEED;
    } else if (rotationSpeed < ROBOT_MIN_SPEED) {
        rotationSpeed = ROBOT_MIN_SPEED;
    }

    if (direction === "Left") {
        socket.emit('motor', createOrder(-rotationSpeed, rotationSpeed, MIN_ORDER_DURATION, getRobotIp(robotId)));
    } else {
        socket.emit('motor', createOrder(rotationSpeed, -rotationSpeed, MIN_ORDER_DURATION, getRobotIp(robotId)));
    }
}

export function moveRobotTo(socket, robotId, x, y) {
    robotId = Number(robotId);
    clearInterval(intervals.get(robotId));

    let direction = "Left";

    const currentInterval = setInterval(() => {
        let robot = getRobot(robotId);

        if (robot !== undefined) {
            let angleDifference = getAngleDifference(robot, x, y);
            angleDifference > 0 ? direction = "Left" : direction = "Right";

            let distanceDifference = distanceBetweenPoints(robot.position, {
                x: x,
                y: y
            });

            const isTargetForward = (angleDifference <= ANGLE_THRESHOLD) && (angleDifference >= -ANGLE_THRESHOLD);
            const isTargetBackward = (angleDifference <= -180 + ANGLE_THRESHOLD) || (angleDifference >= 180 - ANGLE_THRESHOLD);

            if (isTargetForward) {
                socket.emit('motor', createOrder(ROBOT_MAX_SPEED, ROBOT_MAX_SPEED, MIN_ORDER_DURATION, getRobotIp(robotId)));
            } else if (isTargetBackward) {
                socket.emit('motor', createOrder(-ROBOT_MAX_SPEED, -ROBOT_MAX_SPEED, MIN_ORDER_DURATION, getRobotIp(robotId)));
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
                            socket.emit('motor', createOrder(-otherMotorSpeed, -fullSpeedMotor, MIN_ORDER_DURATION, getRobotIp(robotId)));
                        } else {
                            socket.emit('motor', createOrder(otherMotorSpeed, fullSpeedMotor, MIN_ORDER_DURATION, getRobotIp(robotId)));
                        }
                    } else {
                        if (isTargetBehind) {
                            socket.emit('motor', createOrder(-fullSpeedMotor, -otherMotorSpeed, MIN_ORDER_DURATION, getRobotIp(robotId)));
                        } else {
                            socket.emit('motor', createOrder(fullSpeedMotor, otherMotorSpeed, MIN_ORDER_DURATION, getRobotIp(robotId)));
                        }
                    }
                }

            }
            if (distanceDifference < DISTANCE_THRESHOLD) {
                clearInterval(currentInterval);
            }
        }
    }, (MIN_ORDER_DURATION / 2) / (isSimulator ? simulatorSpeed : 1));

    intervals.set(robotId, currentInterval);
}

export function stopRobots(socket) {
    intervals.forEach(interval => {
        clearInterval(interval);
    });

    socket.emit('motor', createOrder(0, 0, 100, "Broadcast"));
}

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

export function isRobotFacing(robotId, x, y) {
    const robot = getRobot(robotId);

    if (robot !== undefined) {
        let angleDifference = getAngleDifference(robot, x, y);

        return Math.abs(angleDifference) <= ANGLE_THRESHOLD;
    }
    return false;
}

export function isRobotNear(robotId, x, y, deltaMax) {
    let robot = getRobot(robotId);

    if (robot !== undefined) {
        let robotPosition = robot.position;
        let delta = distanceBetweenPoints(robotPosition, {x: x, y: y});

        return delta < deltaMax;
    }
    return false;
}

export function distanceBetweenPoints(p1, p2) {
    if (p1 !== undefined && p2 !== undefined) {
        return Math.sqrt(
            Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
        );
    }
}

export function middleOfPoints(p1, p2) {
    return new cv.Point(
        (p1.x + p2.x) / 2,
        (p1.y + p2.y) / 2
    );
}

export function convertCVPointToMathPoint(CVpoint) {
    return {
        x: CVpoint[0],
        y: CVpoint[1]
    };
}

export function calculateBallSize(tableLength) {
    return (tableLength * BALL_REAL_SIZE) / TABLE_REAL_SIZE;
}

export function createOrder(left, right, duration, ipRobot) {
    return {
        left: left,
        right: right,
        duration: duration,
        time: performance.now(),
        ipRobot: ipRobot
    };
}
