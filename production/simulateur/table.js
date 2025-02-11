import Wall from "./objects/wall.js";
import {height, holeRadius, wallSize, width} from "./params.js";
import Hole from "./objects/hole.js";
import {BROADCAST} from "../js/brain/brain-parameters.js";

class Table {
    constructor(robots, balls, vue) {
        this.robots = robots;
        this.balls = balls;
        this.vue = vue;
        this.ballsDetected = [];

        this.walls = [
            new Wall(wallSize, height, 2.5, height / 2),
            new Wall(wallSize, height, width - 2.5, height / 2),
            new Wall(width, wallSize, width / 2, height - 2.5),
            new Wall(width, wallSize, width / 2, 2.5),
        ];

        this.holes = [
            new Hole(holeRadius, holeRadius / 2 + wallSize / 2, height - holeRadius / 2 - wallSize / 2),
            new Hole(holeRadius, holeRadius / 2 + wallSize / 2, holeRadius / 2 + wallSize / 2),
            new Hole(holeRadius, width / 2 + wallSize / 2, holeRadius / 2),
            new Hole(holeRadius, width - holeRadius / 2 - wallSize / 2, holeRadius / 2 + wallSize / 2),
            new Hole(holeRadius, width - holeRadius / 2 - wallSize / 2, height - holeRadius / 2 - wallSize / 2),
            new Hole(holeRadius, width / 2 + wallSize / 2, height - holeRadius / 2)
        ];
    }

    run() {
        this.vue.setup(this);
        this.vue.run();
    }

    sendRobotOrder(order, id) {
        if (id === BROADCAST) {
            for (const robot of this.robots) {
                robot.executeOrder(order);
            }
        } else {
            this.robots[id - 1].executeOrder(order);
        }
    }

    updateDetectedCircles(ballsDetected) {
        this.ballsDetected = ballsDetected;
        this.vue.drawDetectedCircles(ballsDetected);
    }

    updateDetectedRobots(robotsArucos) {
        this.robotsDetected = robotsArucos;
    }

    removeBall(ball) {
        let index = this.balls.indexOf(ball);
        let ballRemoved = this.balls.splice(index, 1)[0];

        this.vue.removeBall(ballRemoved.body);
    }

    getRobots() {
        return this.robots;
    }

    getHoles() {
        return this.holes;
    }

    getBalls() {
        return this.balls;
    }

    getBallsDetected() {
        return this.ballsDetected;
    }

    getRobotsDetected() {
        return this.robotsDetected;
    }
}

export default Table;
