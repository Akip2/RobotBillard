import Table from "../table.js";
import Robot from "../objects/robot.js";
import {ballRadius, height, robotHeight, robotWidth, wheelHeight, wheelWidth, width} from "../params.js";
import Ball from "../objects/ball.js";

class FootConfig extends Table {
    constructor(vue) {
        const robots = [];
        const balls = [];

        // White ball
        balls.push(new Ball(ballRadius, "white", (width / 2) + ballRadius, height / 2));

        // Robots
        let robot1 = new Robot(robotWidth, robotHeight, wheelWidth, wheelHeight, width / 6, height / 2, 0, 1);      // left robot
        let robot2 = new Robot(robotWidth, robotHeight, wheelWidth, wheelHeight, width / 1.1666, height / 2, Math.PI, 2); // right robot
        robots.push(robot1, robot2);

        super(robots, balls, vue);
    }
}

export default FootConfig;
