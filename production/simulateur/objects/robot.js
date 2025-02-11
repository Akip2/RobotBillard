import {Bodies, Body, Composite, Constraint} from "../global.js";
import SimulationObject from "./simulation-object.js";
import {Wheel, WHEEL_SIDE} from "./wheel.js";
import {simulatorSpeed} from "../../js/events/parameters.js";

class Robot extends SimulationObject {
    constructor(width, height, wheelWidth, wheelHeight, x = 0, y = 0, angle = 0) {
        const core = Bodies.rectangle(x, y, width, height, {
            render: {
                fillStyle: "#B6423F", // real color of our robot
            },
            chamfer: {
                radius: [15, 15, 15, 15]
            },
            frictionAir: 1,
            restitution: 0.02 / simulatorSpeed
        });

        const leftWheel = Bodies.rectangle(
            x - height / 2 + wheelWidth / 2,
            y - (height / 2) - wheelHeight,
            wheelWidth,
            wheelHeight, {
                render: {
                    fillStyle: "#2F2F2F" // real color of our robot wheel
                },
            });

        const rightWheel = Bodies.rectangle(
            x - height / 2 + wheelWidth / 2,
            y + (height / 2) + wheelHeight,
            wheelWidth,
            wheelHeight, {
                render: {
                    fillStyle: "#2F2F2F" // real color of our robot wheel
                },
            });


        const body = Body.create({
            parts: [core, rightWheel, leftWheel],

            frictionAir: 1,
            restitution: 0.02
        })

        super(body, width, height, x, y);

        const wheel1 = new Wheel(this, wheelWidth, wheelHeight, WHEEL_SIDE.LEFT);
        const wheel2 = new Wheel(this, wheelWidth, wheelHeight, WHEEL_SIDE.RIGHT);

        this.wheelLeft = wheel1;
        this.wheelRight = wheel2;

        this.aruco = Bodies.rectangle(x, y, width, height, {
            collisionFilter: {
                mask: 0x0000 //ignore collisions and mouse drag
            },
            render: {
                sprite: {
                    texture: "../../img/aruco-marker-ID-457.svg",
                    xScale: 0.1,
                    yScale: 0.1,
                }
            }
        });

        Body.setAngle(body, angle);
    }

    executeOrder(order) {
        if (order.left < 0) {
            this.wheelLeft.setDirection(-1);
        } else {
            this.wheelLeft.setDirection(1);
        }

        if (order.right < 0) {
            this.wheelRight.setDirection(-1);
        } else {
            this.wheelRight.setDirection(1);
        }

        this.wheelLeft.setSpeed(Math.abs(order.left), order.duration /1.2**(simulatorSpeed-1));
        this.wheelRight.setSpeed(Math.abs(order.right), order.duration / 1.2**(simulatorSpeed-1));
    }

    addToEnv(world) {
        super.addToEnv(world);

        this.wheelLeft.addToEnv(world);
        this.wheelRight.addToEnv(world);
        Composite.add(world, this.aruco);
    }
}

export default Robot;
