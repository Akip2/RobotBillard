import Table from "../table.js";
import Robot from "../objects/robot.js";
import {
    ballColors,
    ballRadius,
    height,
    robotHeight,
    robotWidth,
    wallSize,
    wheelRadius,
    width
} from "../params.js";
import Ball from "../objects/ball.js";

class EasyConfig extends Table {
    constructor(vue) {
        const robots = [new Robot(robotWidth, robotHeight, wheelRadius, width/3, height/2)];
        const balls = [];

        // top balls
        let topLeftBall = new Ball(
            ballRadius,
            ballColors[Math.floor(Math.random() * 7)],  // random color
            wallSize*2.5,                                   // x
            wallSize*2.5,                                   // y
            ((Math.random() * 2) < 1)                       // circle ball or not
        )
        let topMiddleBall = new Ball(
            ballRadius,
            ballColors[Math.floor(Math.random() * 7)],
            width/2 + ballRadius,
            wallSize*2.5,
            ((Math.random() * 2) < 1)
        )
        let topRightBall = new Ball(
            ballRadius,
            ballColors[Math.floor(Math.random() * 7)],
            width - (wallSize*2.5),
            wallSize*2.5,
            ((Math.random() * 2) < 1)
        )

        // bottom balls
        let bottomLeftBall = new Ball(
            ballRadius,
            ballColors[Math.floor(Math.random() * 7)],
            wallSize*2.5,
            height - (wallSize*2.5),
            ((Math.random() * 2) < 1)
        )
        let bottomMiddleBall = new Ball(
            ballRadius,
            ballColors[Math.floor(Math.random() * 7)],
            width/2 + ballRadius,
            height - (wallSize*2.5),
            ((Math.random() * 2) < 1)
        )
        let bottomRightBall = new Ball(
            ballRadius,
            ballColors[Math.floor(Math.random() * 7)],
            width - (wallSize*2.5),
            height - (wallSize*2.5),
            ((Math.random() * 2) < 1)
        )

        balls.push(topLeftBall, topMiddleBall, topRightBall, bottomLeftBall, bottomMiddleBall, bottomRightBall);

        super(robots, balls, vue);
    }
}

export default EasyConfig;