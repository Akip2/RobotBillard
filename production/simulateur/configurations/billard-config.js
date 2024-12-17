import Table from "../table.js";
import Robot from "../objects/robot.js";
import {
    ballColors,
    ballRadius,
    height,
    robotHeight,
    robotWidth,
    wheelRadius,
    width
} from "../params.js";
import Ball from "../objects/ball.js";
import robot from "../objects/robot.js";

class BillardConfig extends Table {
    constructor(vue) {
        const robots = [new Robot(robotWidth, robotHeight, wheelRadius, width/3, height/2)];

        const balls = [];

        let x = width / 4 * 3;
        let y = height / 2;
        let nbCol = 5;

        // White ball
        balls.push(new Ball(ballRadius, "white", width / 2, height / 2));

        for (let i = 0; i <= nbCol; i++) {
            for (let j = 0; j < i; j++) {
                let ball = new Ball(ballRadius, ballColors[
                    Math.floor(Math.random() * 7)
                    ], x, y, (Math.random() * 2) < 1);
                balls.push(ball);

                y += ballRadius * 2;
            }

            y = height / 2 - (i * ballRadius);
            x += ballRadius * 2 - 3; // pour se faire rapprocher les balles
        }

        super(robots, balls, vue);

        //robots[0].move(10,10,0,1);
    }
}

export default BillardConfig;