import {Bodies, Body, COLLISION_FILTERS, Composite, Constraint} from "../global.js";
import SimulationObject from "./simulation-object.js";
import {Wheel, WHEEL_SIDE} from "./wheel.js";

class Robot extends SimulationObject {
    constructor(width, height, wheelWidth, wheelHeight, x = 0, y = 0, angle = 0) {
        const core = Bodies.rectangle(x, y, width, height, {
            render: {
                fillStyle: "#B6423F" // real color of our robot
            },
            frictionAir: 1,
        });

        super(core, width, height, x, y);

        const wheel1 = new Wheel(this, wheelWidth, wheelHeight, WHEEL_SIDE.LEFT);
        const wheel2 = new Wheel(this, wheelWidth, wheelHeight, WHEEL_SIDE.RIGHT);

        this.wheelLeft = wheel1;
        this.wheelRight = wheel2;

        this.bodyArray = [core, wheel1.body, wheel2.body];

        Body.setAngle(core, angle);
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

        this.wheelLeft.setSpeed(Math.abs(order.left), order.duration);
        this.wheelRight.setSpeed(Math.abs(order.right), order.duration);
    }

    addToEnv(world) {
        super.addToEnv(world);

        this.wheelLeft.addToEnv(world);
        this.wheelRight.addToEnv(world);
    }
}

export default Robot;