import {simulatorSpeed} from "../events/parameters.js";
import {getRobot} from "../elements-manager.js";
import {
    ANGLE_THRESHOLD,
    BALL_REAL_SIZE,
    DISTANCE_THRESHOLD,
    MIN_ORDER_DURATION,
    ROBOT_MAX_SPEED, ROBOT_MIN_SPEED,
    TABLE_REAL_SIZE
} from "./brain-parameters.js";
import {isSimulator} from "../events/view-manager.js";

let currentInterval = null;

export function turnRobot(socket, robotIp, x, y) {
    if(currentInterval !== null) {
        clearInterval(currentInterval);
    }

    let direction = "Left";

    currentInterval = setInterval(() => {
        const robot = getRobot(0);
        const angleDifference = getAngleDifference(robot, x, y);

        angleDifference > 0 ? direction = "Left" : direction = "Right";

        if(Math.abs(angleDifference) <= ANGLE_THRESHOLD) {
            clearInterval(currentInterval);
        }

        let rotationSpeed = Math.abs(angleDifference) * 2;
        if(rotationSpeed > ROBOT_MAX_SPEED) {
            rotationSpeed = ROBOT_MAX_SPEED;
        } else if(rotationSpeed < ROBOT_MIN_SPEED) {
            rotationSpeed = ROBOT_MIN_SPEED;
        }

        console.log(rotationSpeed);

        if (direction === "Left") {
            socket.emit('motor', createOrder(-rotationSpeed, rotationSpeed, MIN_ORDER_DURATION, robotIp));
        } else {
            socket.emit('motor', createOrder(rotationSpeed, -rotationSpeed, MIN_ORDER_DURATION, robotIp));
        }
    }, (MIN_ORDER_DURATION) / (isSimulator ? simulatorSpeed : 1))
}

export function moveRobotTo(socket, robotIp, x, y) {
    if (currentInterval !== null) {
        clearInterval(currentInterval);
    }

    let direction = "Left";

    currentInterval = setInterval(() => {
        let robot = getRobot(0);

        if (robot !== undefined) {
            let robotPosition = robot.position;
            let robotAngle = robot.orientation;

            let distanceDifference = distanceBetweenPoints(robotPosition, {
                x: x,
                y: y
            });

            if (distanceDifference < DISTANCE_THRESHOLD) {
                clearInterval(currentInterval);
            }

            let baseAngle = Math.atan2(robotPosition.y - y, x - robotPosition.x) * (180 / Math.PI);
            let targetAngle = baseAngle < 0 ? baseAngle + 360 : baseAngle;
            let angleDifference = (targetAngle - robotAngle) + 360 % 360;

            if (angleDifference < -180) {
                angleDifference += 360;
            } else if (angleDifference > 180) {
                angleDifference -= 360;
            }

            angleDifference > 0 ? direction = "Left" : direction = "Right";

            const isTargetForward = (angleDifference <= ANGLE_THRESHOLD) && (angleDifference >= -ANGLE_THRESHOLD);
            const isTargetBackward = (angleDifference <= -180 + ANGLE_THRESHOLD) || (angleDifference >= 180 - ANGLE_THRESHOLD);

            if (isTargetForward) {
                socket.emit('motor', createOrder(ROBOT_MAX_SPEED, ROBOT_MAX_SPEED, MIN_ORDER_DURATION, robotIp));
            } else if (isTargetBackward) {
                socket.emit('motor', createOrder(-ROBOT_MAX_SPEED, -ROBOT_MAX_SPEED, MIN_ORDER_DURATION, robotIp));
            } else {
                // Tries to turn and go forward / backward smoothly
                const isTargetBehind = angleDifference > 90 || angleDifference < -90;

                let otherMotorSpeed = Math.abs(90 - Math.abs(angleDifference)) / 180 * ROBOT_MAX_SPEED;
                let fullSpeedMotor = ROBOT_MAX_SPEED;

                // Needs to turn before moving if too close to the target
                if (distanceDifference < DISTANCE_THRESHOLD * 2) {
                    otherMotorSpeed = -ROBOT_MAX_SPEED / 2;
                    fullSpeedMotor /= 2;
                }

                if (direction === "Left") {
                    if (isTargetBehind) {
                        socket.emit('motor', createOrder(-otherMotorSpeed, -fullSpeedMotor, MIN_ORDER_DURATION, robotIp));
                    } else {
                        socket.emit('motor', createOrder(otherMotorSpeed, fullSpeedMotor, MIN_ORDER_DURATION, robotIp));
                    }
                } else {
                    if (isTargetBehind) {
                        socket.emit('motor', createOrder(-fullSpeedMotor, -otherMotorSpeed, MIN_ORDER_DURATION, robotIp));
                    } else {
                        socket.emit('motor', createOrder(fullSpeedMotor, otherMotorSpeed, MIN_ORDER_DURATION, robotIp));
                    }
                }
            }
        }
    }, (MIN_ORDER_DURATION / 2) / (isSimulator ? simulatorSpeed : 1));
}

export function stopRobots(socket) {
    clearInterval(currentInterval);
    socket.emit('motor', createOrder(0, 0, 100, "Broadcast"));
}

export function getAngleDifference(robot, x, y) {
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

export function isRobotNear(robotIp, x, y, deltaMax) {
    let robot = getRobot(0);

    if (robot !== undefined) {
        let robotPosition = robot.position;
        let delta = distanceBetweenPoints(robotPosition, {x: x, y: y});

        return delta < deltaMax;
    }
    return false;
}

export function isRobotFacing(robotIp, x, y) {
    const robot = getRobot(0);
    if (robot !== undefined) {
        let robotPosition = robot.position;
        let robotAngle = robot.orientation;
        let baseAngle = Math.atan2(robotPosition.y - y, x - robotPosition.x) * (180 / Math.PI);
        let targetAngle = baseAngle < 0 ? baseAngle + 360 : baseAngle;
        let angleDifference = (targetAngle - robotAngle) + 360 % 360;

        return Math.abs(angleDifference) <= ANGLE_THRESHOLD;
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
