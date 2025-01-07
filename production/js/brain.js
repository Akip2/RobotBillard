import {getRobot} from "./video.js";

export function moveRobotForward(socket, distance, time = 3000) {
    // dist = 0,6245 * puissance - 11,66;

    let duration = time;
    let speedFor3Sec = (distance + 11.66) / 0.6;
    let realSpeed = Math.round(speedFor3Sec * (3000 / duration));

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

    socket.emit('motor', createOrder(realSpeed, realSpeed, duration));
}

export function turnRobot(socket, angle) {
    let time = (1330 / 2) * (Math.abs(angle * (Math.PI / 180)) / Math.PI);

    if (angle > 180) {
        socket.emit('motor', createOrder(-128, 128, time));
    } else {
        socket.emit('motor', createOrder(128, -128, time));
    }
}

export function turnRobotInCircle(socket, radius, angle) {
    // if radius = 21
    // divide time by angle or something similar
    let speedLeft = 255;
    let speedRight = 128;
    let time = 2300;

    // TODO

    socket.emit('motor', createOrder(speedLeft, speedRight, time));
}

export function moveRobotTo(socket, x, y) {
    let robot = getRobot(0); //TODO
    let robotAngle = robot.orientation;

    let distance = distanceBetweenPoints(robot.position, {x: x, y: y}) / (calculateBallSize(460) / 4.5);
    let targetAngle = Math.atan2(robot.position.y - y, x - robot.position.x) * (180 / Math.PI);

    console.log(distance)
    console.log(robotAngle)
    console.log(targetAngle)

    let interval = setInterval(() => {
        let delta = Math.abs(getRobot(0).orientation - targetAngle);

        if (delta > 30) {
            turnRobot(socket, targetAngle);
        } else {
            clearInterval(interval);
        }
    }, 1500);

    moveRobotForward(socket, distance);
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
    console.log("bien ici : ");
    console.log(ipRobot)
    return {
        left: left,
        right: right,
        duration: duration,
        // time: Date.now()
        time: performance.now(),
        ipRobot: ipRobot,
    };
}
