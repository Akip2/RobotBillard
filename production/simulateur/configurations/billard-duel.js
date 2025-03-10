import Table from "../table.js";
import Robot from "../objects/robot.js";
import {height, robotHeight, robotWidth, wheelHeight, wheelWidth, width} from "../params.js";
import {placerBoulesBillardConfiguration} from "./global-config.js";

class BillardDuelConfig extends Table {
    constructor(vue) {

        const robots = [
            new Robot(robotWidth, robotHeight, wheelWidth, wheelHeight, width / 3, height * (1 / 3)),
            new Robot(robotWidth, robotHeight, wheelWidth, wheelHeight, width / 3, height * (2 / 3))
        ];
        let balls = placerBoulesBillardConfiguration();

        super(robots, balls, vue);
    }
}

export default BillardDuelConfig;
