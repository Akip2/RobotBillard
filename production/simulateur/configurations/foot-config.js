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

class FootConfig extends Table {
    constructor(vue) {
        const robots = [];
        const balls = [];

        // White ball
        balls.push(new Ball(ballRadius, "white", (width/2) + ballRadius, height / 2));

        // Robots
        let robot1 = new Robot(robotWidth, robotHeight, wheelRadius, width/6, height/2); // left robot
        let robot2 = new Robot(robotWidth, robotHeight, wheelRadius, width/1.1666, height/2); // right robot
        robots.push(robot1, robot2);

        super(robots, balls, vue);
    }
}

export default FootConfig;