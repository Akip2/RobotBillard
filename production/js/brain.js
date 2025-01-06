export function moveRobotForward(socket, distance, time) {
    // dist = 0,6245 * puissance - 11,66;
    let speedFor3Sec = (distance + 11.66) / 0.6;
    let realSpeed = Math.round(speedFor3Sec * (3000 / time));

    if (realSpeed < 64) {
        realSpeed = 64;
    }

    if (realSpeed > 255) {
        console.log("Impossible in time ! " + realSpeed + " / 255");
    } else {
        console.log(realSpeed + " / 255");
    }
    console.log(time + " ms")

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
    let speedLeft = 128;
    let speedRight = 255;
    let time = 2000;

    

    socket.emit('motor', createOrder(speedLeft, speedRight, time));
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
