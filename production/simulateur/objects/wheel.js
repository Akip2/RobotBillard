import {Bodies, Body, Constraint, Composite} from "../global.js";
import SimulationObject from "./simulation-object.js";

const WHEEL_SIDE = Object.freeze({
    LEFT: -1,
    RIGHT: 1,
});

class Wheel extends SimulationObject {
    constructor(robot, wheelWidth, wheelHeight, side) {
        const relativeX = (-robot.getWidth() / 2) + wheelWidth / 2;
        const relativeY = side*(robot.getHeight() / 2) + side*wheelHeight;

        const core=Bodies.rectangle(robot.getX() + relativeX, robot.getY() + relativeY, wheelWidth, wheelHeight, {
            render: {
                fillStyle: "#2F2F2F" // real color of our robot
            },

            collisionFilter: {
                group: -1,
                category: 2,
                mask: 0,
            },
        });

        const pin1 = Constraint.create({
            bodyA: robot.body,
            pointA: {x: relativeX-wheelWidth/2, y: relativeY},

            bodyB: core,
            pointB: {x: -wheelWidth/2, y: 0},
            stiffness: 0.8,
            length: 0,

            render: {
                visible: false
            },

            isStatic: true,
        });

        const pin2 = Constraint.create({
            bodyA: robot.body,
            pointA: {x: relativeX+wheelWidth/2, y: relativeY},

            bodyB: core,
            pointB: {x: wheelWidth/2, y: 0},
            stiffness: 0.8,
            length: 0,

            render: {
                visible: false
            },

            isStatic: true,
        });

        const pin3 = Constraint.create({
            bodyA: robot.body,
            pointA: {x: relativeX, y: relativeY},

            bodyB: core,
            pointB: {x: 0, y: 0},
            stiffness: 0.8,
            length: 0,

            render: {
                visible: false
            },

            isStatic: true,
        });

        /*
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
        */

        super(core, wheelWidth, wheelHeight);

        this.speed = 0;
        this.direction = 1;
        this.isMoving = false;

        this.bodyArray = [core, pin1, pin2, pin3];

        this.robot = robot;
    }

    setDirection(direction) {
        this.direction = direction;
    }

    setSpeed(speed, duration=1000) {
        this.speed = speed/3;

        let delta=0;

        if (this.isMoving && this.speed === 0) {  // Stops the robot
            clearInterval(this.movingInterval);
        } else if (!this.isMoving && this.speed > 0) {  // The robot starts moving
            this.movingInterval = setInterval(() => {
                this.moving();
                delta += 10;

                if(delta >= duration){
                    clearInterval(this.movingInterval); //End of duration, the robot stops executing the order
                }
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