import Wall from "./objects/wall.js";
import {width, height, holeRadius, wallSize} from "./params.js";
import Hole from "./objects/hole.js";
import wall from "./objects/wall.js";

class Table {
    constructor(robots, balls, vue) {
        this.robots = robots;
        this.balls = balls;
        this.vue = vue;

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

    removeBall(ball) {
        let index = this.balls.indexOf(ball);
        let ballRemoved = this.balls.splice(index, 1)[0];

        this.vue.removeBall(ballRemoved.body);
    }

    getBalls() {
        return this.balls;
    }

    run() {
        this.vue.setup(this);
        this.vue.run();
    }
}

export default Table;