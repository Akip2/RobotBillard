import Table from "../table.js";
import Robot from "../objects/robot.js";
import {
    ballColors,
    ballRadius,
    height,
    robotHeight,
    robotWidth,
    wallSize, wheelHeight, wheelWidth,
    width
} from "../params.js";
import Ball from "../objects/ball.js";

class FootConfig extends Table {
    constructor(vue, camera) {
        const robots = [];
        const balls = [];

        // White ball
        balls.push(new Ball(ballRadius, "white", (width / 2) + ballRadius, height / 2));

        // Robots
        let robot1 = new Robot(robotWidth, robotHeight, wheelWidth, wheelHeight, width / 6, height / 2);      // left robot
        let robot2 = new Robot(robotWidth, robotHeight, wheelWidth, wheelHeight, width / 1.1666, height / 2, Math.PI); // right robot
        robots.push(robot1, robot2);

        super(robots, balls, vue, camera);
    }
}

export default FootConfig;