import {Bodies, Body, COLLISION_FILTERS} from "../global.js";
import SimulationObject from "./simulation-object.js";

class Ball extends SimulationObject {
    constructor(radius, color, x = 0, y = 0, circled = false) {
        let body;
        const core = Bodies.circle(x, y, radius, {
            restitution: 0.5,
            frictionAir: 0.025,
            render: {
                fillStyle: color
            },

            collisionFilter: {
                category: COLLISION_FILTERS.BALL,
            }
        });

        const collisionCenter = Bodies.circle(x, y, radius * 0.25, {
            collisionFilter: {
                category: COLLISION_FILTERS.BALL_CENTER,
                mask: COLLISION_FILTERS.HOLE
            }
        });

        if (circled) {
            const circle = Bodies.circle(x, y, radius * 0.5, {
                render: {
                    fillStyle: "white"
                },
            });

            body = Body.create({
                parts: [collisionCenter, core, circle],
                restitution: 0.75,
            });
        } else {
            body = Body.create({
                parts: [collisionCenter, core],
                restitution: 0.75,
            });
        }

        super(body, radius * 2, radius * 2);

        this.collisionCenter = collisionCenter;
    }
}

export default Ball;
