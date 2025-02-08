import {simulatorSpeed} from "../events/parameters.js";
import {getRobot} from "../elements-manager.js";
import {BALL_REAL_SIZE, MIN_ORDER_DURATION, ROBOT_MAX_SPEED, TABLE_REAL_SIZE} from "./brain-parameters.js";

let currentInterval = null;

/**
 *
 * @param socket
 * @param robotIp
 * @param distance in centimeter
 * @param direction
 */
export function moveRobotStraightLine(socket, robotIp, distance, direction = 1) {
    let duration = 3000;

    // We know how far the robot goes in 3 seconds at a certain power,
    // so we can deduce how many power is needed and how much time
    let speedFor3Sec = (distance + 11.66) / 0.6;
    let realSpeed = Math.round(speedFor3Sec * (3000 / duration));

    // Tries to minimize time
    while ((realSpeed > ROBOT_MAX_SPEED) || (realSpeed < 200)) {
        realSpeed < 200 ? duration -= MIN_ORDER_DURATION : duration += MIN_ORDER_DURATION;

        realSpeed = Math.round(speedFor3Sec * (3000 / duration));
    }

    socket.emit('motor', createOrder(realSpeed * direction, realSpeed * direction, duration, robotIp));
}

export function turnRobot(socket, robotIp, angle, direction) {
    // We know how much time we need to turn in a certain angle at 128 power

    // let duration = (1330 / 2) * (Math.abs(angle * (Math.PI / 180)) / Math.PI);
    // console.log("ANGLE : "+Math.abs(angle * (Math.PI / 180)));

    // let speed = 128 * Math.abs(angle * (Math.PI / 180));
    //
    // if (direction === "Left") {
    //     socket.emit('motor', createOrder(-speed, speed, robotOrderMinimalDuration, robotIp));
    // } else { // Right
    //     socket.emit('motor', createOrder(speed, -speed, robotOrderMinimalDuration, robotIp));
    // }

    // let duration = (1330 / 2) * (Math.abs(angle * (Math.PI / 180)) / Math.PI);
    let duration = 50;

    if (direction === "Left") {
        socket.emit('motor', createOrder(-128, 128, duration, robotIp));
    } else { // Right
        socket.emit('motor', createOrder(128, -128, duration, robotIp));
    }
}

export function moveRobotTo(socket, robotIp, x, y) {
    if (currentInterval !== null) {
        clearInterval(currentInterval);
    }

    let direction = "Left";
    let angleThreshold = 10;
    let distanceThreshold = 5;

    currentInterval = setInterval(() => {
        let robot = getRobot(0);

        if (robot !== undefined) {
            let robotPosition = robot.position;
            let robotAngle = robot.orientation;

            let distanceDifference = distanceBetweenPoints(robotPosition, {
                x: x,
                y: y
            }) / (calculateBallSize(460) / 4);

            if (distanceDifference < distanceThreshold) {
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

            const isTargetForward = (angleDifference <= angleThreshold) && (angleDifference >= -angleThreshold);
            const isTargetBackward = (angleDifference <= -180 + angleThreshold) || (angleDifference >= 180 - angleThreshold);

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
                if (distanceDifference < distanceThreshold * 2) {
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
    }, (MIN_ORDER_DURATION / 2) / simulatorSpeed);
}

export function isRobotNear(robotIp, x, y, deltaMax) {
    let robot = getRobot(0);

    if (robot !== undefined) {
        let robotPosition = robot.position;
        let delta = distanceBetweenPoints(robotPosition, {x: x, y: y});

        return delta < deltaMax;
    }
    return false; // Good idea ?
}

export function distanceBetweenPoints(p1, p2) {
    if (p1 !== undefined && p2 !== undefined) {
        return Math.sqrt(
            Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
        );
    } else {
        return -1;
    }
}

export function calculateBallSize(tableLength) {
    return (tableLength * BALL_REAL_SIZE) / TABLE_REAL_SIZE;
}

export function createOrder(left, right, duration, ipRobot) {
    let broadcastToAll = document.getElementById("checkbox-allRobots").checked;

    if (broadcastToAll) {
        ipRobot = -1;
    }

    return {
        left: left,
        right: right,
        duration: duration,
        time: performance.now(),
        ipRobot: ipRobot
    };
}
