import {getRobot} from "./index.js";

let currentInterval = null;

/**
 *
 * @param socket
 * @param robotIp
 * @param distance in centimeter
 * @param time in milliseconds
 */
export function moveRobotForward(socket, robotIp, distance, time = 3000) {
    let duration = time;

    // We know how far the robot goes in 3 seconds at a certain power,
    // so we can deduce how many power is needed and how much time
    let speedFor3Sec = (distance + 11.66) / 0.6;
    let realSpeed = Math.round(speedFor3Sec * (3000 / duration));

    // Tries to minimize time
    while (realSpeed > 255 || realSpeed < 200) {
        if (realSpeed < 200) {
            duration -= 100;
        } else {
            duration += 100;
        }
        realSpeed = Math.round(speedFor3Sec * (3000 / duration));
    }
    // console.log(duration + " ms")
    // console.log(realSpeed + " / 255");

    socket.emit('motor', createOrder(realSpeed, realSpeed, duration, robotIp));
}

export function turnRobot(socket, robotIp, direction) {
    // We know how much time we need to turn in a certain angle at 128 power
    let angle = 5;
    let time = (1330 / 2) * (Math.abs(angle * (Math.PI / 180)) / Math.PI);

    if (direction === "Left") {
        socket.emit('motor', createOrder(-128, 128, time, robotIp));
    } else {
        socket.emit('motor', createOrder(128, -128, time, robotIp));
    }
}

export function moveRobotTo(socket, robotIp, x, y) {
    if(currentInterval !== null){
        clearInterval(currentInterval);
    }

    let robot = getRobot(0);

    if (robot !== undefined) {
        let robotPosition = robot.position;
        let targetAngle = Math.atan2(robotPosition.y - y, x - robotPosition.x) * (180 / Math.PI);

        targetAngle = targetAngle < 0 ? targetAngle + 360 : targetAngle;
        console.log("==========")
        // Step 1 : turn

        currentInterval = setInterval(() => {
            robot = getRobot(0);

            if (robot !== undefined) {
                let robotAngle = robot.orientation;
                let delta = Math.abs(targetAngle - robotAngle);

                console.log("target : " + targetAngle)
                console.log("robot : " + robotAngle)
                console.log("delta : " + delta)

                let limit = 10;

                if ((delta <= limit) && (delta >= -limit)) {
                    // Step 2 : move forward
                    clearInterval(currentInterval);
                    currentInterval = setInterval(() => {
                        robot = getRobot(0);

                        if (robot !== undefined) {
                            robotPosition = robot.position;

                            let distance = distanceBetweenPoints(robotPosition, {
                                x: x,
                                y: y
                            }) / (calculateBallSize(460) / 4.5)

                            if (distance > 25) {
                                moveRobotForward(socket, robotIp, 5);
                            } else {
                                clearInterval(currentInterval);
                            }
                        }
                    }, 100);
                } else if (robotAngle < targetAngle) {
                    turnRobot(socket, robotIp, "Left");
                } else {
                    turnRobot(socket, robotIp, "Right");
                }
            }
        }, 100);
    }
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
    return Math.sqrt(
        Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
    );
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
