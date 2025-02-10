import {simulatorSpeed} from "./events/parameters.js";
import {getRobot} from "./elements-manager.js";

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
    while ((realSpeed > 255) || (realSpeed < 200)) {
        realSpeed < 200 ? duration -= 100 : duration += 100;

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
    //     socket.emit('motor', createOrder(-speed, speed, 100, robotIp));
    // } else { // Right
    //     socket.emit('motor', createOrder(speed, -speed, 100, robotIp));
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
    let angleThreshold = 22.5;
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

            if ((angleDifference <= angleThreshold) && (angleDifference >= -angleThreshold)) {
                if (distanceDifference > distanceThreshold) {
                    socket.emit('motor', createOrder(255, 255, 100, robotIp));
                } else {
                    clearInterval(currentInterval);
                }
            } else {
                if (direction === "Left") {
                    if (angleDifference > 90 || angleDifference < -90) {
                        socket.emit('motor', createOrder(-(angleDifference / 360) * 255, -255, 100, robotIp));
                    } else {
                        socket.emit('motor', createOrder((angleDifference / 360) * 255, 255, 100, robotIp));
                    }
                } else {
                    if (angleDifference > 90 || angleDifference < -90) {
                        socket.emit('motor', createOrder(-255, -(angleDifference / 360) * 255, 100, robotIp));
                    } else {
                        socket.emit('motor', createOrder(255, (angleDifference / 360) * 255, 100, robotIp));
                    }
                }
            }
        }
    }, 50/simulatorSpeed);
}

export function turnRobotInCircle(socket, robotIp, radius, angle) {
    // if radius = 21
    // divide time by angle or something similar
    let speedLeft = 255;
    let speedRight = 128;
    let time = 2300;

    socket.emit('motor', createOrder(speedLeft, speedRight, time, robotIp));
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
    let ballRealSize = 4.5;
    let tableRealSize = 118.5;

    return (tableLength * ballRealSize) / tableRealSize;
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
