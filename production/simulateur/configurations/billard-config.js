import Table from "../table.js";
import Robot from "../objects/robot.js";
import {
    ballColors,
    ballSize,
    height,
    holeSize,
    robotHeight,
    robotWidth,
    wallSize,
    wheelSize,
    width
} from "../params.js";
import Ball from "../objects/ball.js";

class BillardConfig extends Table {
    constructor(vue) {
        const robots = [new Robot(robotWidth, robotHeight, wheelSize, width/3, height/2)];

        const balls = [];

        let x = width / 4 * 3;
        let y = height / 2;
        let nbCol = 5;

        // White ball
        balls.push(new Ball(ballSize, ballColors[7], width / 2, height / 2));

        for (let i = 0; i <= nbCol; i++) {
            for (let j = 0; j < i; j++) {
                let ball = new Ball(ballSize, ballColors[
                    Math.floor(Math.random() * 7)
                    ], x, y);
                balls.push(ball);

                y += ballSize * 2;
            }
            y = height / 2 - (i * ballSize);
            x += ballSize * 2 - 3; // pour se faire rapprocher les balles
        }

        super(robots, balls, vue);
    }
}

export default BillardConfig;