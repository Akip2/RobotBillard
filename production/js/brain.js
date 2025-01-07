export function moveRobotForward(socket, distance, time) {
    // TODO must automatically use minimum time
    // dist = 0,6245 * puissance - 11,66;

    // let time = 3000;
    let speedFor3Sec = (distance + 11.66) / 0.6;
    let realSpeed = Math.round(speedFor3Sec * (3000 / time));

    // while (realSpeed > 255) {
        if (realSpeed > 255) {
            // time += 100;
            // realSpeed = Math.round(speedFor3Sec * (3000 / time));
            console.log("Impossible in time ! " + realSpeed + " / 255");
        } else /*if (realSpeed < 200)*/ {
            // time -= 100;
            console.log(realSpeed + " / 255");
        }
        console.log(time + " ms")
    // }
    if (realSpeed < 64) {
        realSpeed = 64;
        // time -= 100;
    }

    socket.emit('motor', createOrder(realSpeed, realSpeed, time));
}

export function turnRobot(socket, radianAngle) {
    let time = (1330 / 2) * Math.abs(radianAngle / Math.PI);
    // let time = 580 * Math.abs(radianAngle / Math.PI);

    console.log(Math.abs(radianAngle / Math.PI));
    console.log(time);

    if (radianAngle < 0) {
        socket.emit('motor', createOrder(-128, 128, time));
        // socket.emit('motor', createOrder(-255, 255, time));
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
    let robotPos = {x: x, y: y};// getRobotPos; //TODO
    let robotAngle = Math.PI;//getRobotAngle //TODO

    let distance = distanceBetweenPoints(robotPos, {x: x, y: y});
    console.log(distance)
    let angle = robotAngle + Math.atan2(robotPos.y - y, x - robotPos.x) / Math.PI;

    turnRobot(socket, angle);
    moveRobotForward(socket, distance, 2000);
}

export function distanceBetweenPoints(p1, p2) {
    return Math.sqrt(
        Math.pow(p1.x - p1.y, 2) + Math.pow(p2.x - p2.y, 2)
    );
}

export function calculateBallSize(tableLength) {
    let ballRealSize = 4.5;
    let tableRealSize = 118.5;

    return (tableLength * ballRealSize) / tableRealSize;
}

export function createOrder(left, right, duration) {
    return {
        left: left,
        right: right,
        duration: duration,
        // time: Date.now()
        time: performance.now(),
    };
}
