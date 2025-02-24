import {Bodies} from "../global.js";
import SimulationObject from "./simulation-object.js";

class Wall extends SimulationObject {
    constructor(width, height, x = 0, y = 0) {
        const body = Bodies.rectangle(x, y, width, height, {
            isStatic: true,
            restitution: 0.75,
            render: {
                fillStyle: "black"
            }
        });

        super(body, width, height);
    }
}

export default Wall;
