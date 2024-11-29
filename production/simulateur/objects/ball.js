import {Bodies, COLLISION_FILTERS} from "../global.js";
import SimulationObject from "./simulation-object.js";

class Ball extends SimulationObject{
    constructor(radius, color, x=0, y=0){
        const body=Bodies.circle(0, 0, radius, {
            restitution:0.75,
            frictionAir: 0.015,
            collisionFilter: {
                category: COLLISION_FILTERS.BALL,
            },

            render: {
              fillStyle : color
            }
        });

        super(body, radius*2, radius*2, x, y);
    }
}

export default Ball;