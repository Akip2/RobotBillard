import {Bodies, Body, Constraint, Composite} from "../global.js";
import SimulationObject from "./simulation-object.js";

const WHEEL_SIDE = Object.freeze({
    LEFT: -1,
    RIGHT: 1,
});

class Wheel extends SimulationObject {
    constructor(robot, radius, side) {
        const relativeX = (-robot.getWidth() / 2) + radius / 3;
        const relativeY = side * (robot.getHeight() / 2) - side * (radius / 2);

        const core = Bodies.circle(robot.getX() + relativeX, robot.getY() + relativeY, radius, {
            render: {
                fillStyle: "#2F2F2F" // real color of our robot
            },

            collisionFilter: {
                group: -1,
                category: 2,
                mask: 0,
            },
        });

        const pin = Constraint.create({
            bodyA: robot.body,
            pointA: {x: relativeX, y: relativeY},
            bodyB: core,
            pointB: {x: 0, y: 0},
            stiffness: 1,
            length: 0,
        });

        super(core, radius * 2, radius * 2);

        this.speed = 0;
        this.direction = 1;
        this.isMoving = false;

        this.bodyArray = [core, pin];

        this.robot = robot;
    }

    setDirection(direction) {
        this.direction = direction;
    }

    setSpeed(speed) {
        this.speed = speed;

        if (this.isMoving && this.speed === 0) {  // Stops the robot
            clearInterval(this.movingInterval);
        } else if (!this.isMoving && this.speed > 0) {  // The robot starts moving
            this.movingInterval = setInterval(() => {
                this.moving();
            }, 10);
        }
    }

    moving() {
        let robotAngle = this.robot.getAngle();
        let speedX = Math.cos(robotAngle) * this.speed * this.direction;
        let speedY = Math.sin(robotAngle) * this.speed * this.direction;

        Body.setVelocity(this.body, {x: speedX, y: speedY});
    }

    addToEnv(world) {
        this.bodyArray.forEach((element) => {
            Composite.add(world, element);
        })
    }
}

export {
    WHEEL_SIDE,
    Wheel
}