import {Bodies, COLLISION_FILTERS} from "../global.js";
import SimulationObject from "./simulation-object.js";

class Hole extends SimulationObject{
    constructor(radius, x=0, y=0){
        const body=Bodies.circle(0, 0, radius, {
            isStatic: true,

            collisionFilter: {
                category: COLLISION_FILTERS.HOLE,
            },

            render: {
                fillStyle: "black",
                strokeStyle: '#0a0a0a',
                lineWidth: 5,
            }
        });

        super(body, radius*2, radius*2, x, y);
    }
}

export default Hole;