import {Bodies, Body, COLLISION_FILTERS} from "../global.js";
import SimulationObject from "./simulation-object.js";

class Ball extends SimulationObject{
    constructor(radius, color, x=0, y=0, circled=false){
        let body;
        const core=Bodies.circle(x, y, radius, {
            restitution:0.5,
            frictionAir: 0.025,
            collisionFilter: {
                category: COLLISION_FILTERS.BALL,
            },
            render: {
              fillStyle : color
            }
        });

        if(circled){
            const circle=Bodies.circle(x, y, radius*0.5, {
                render: {
                    fillStyle : "white"
                }
            });

            body=Body.create({
                parts: [core, circle],
                restitution:0.75,
            });
        }
        else{
            body=core;
        }

        super(body, radius*2, radius*2);
    }
}

export default Ball;