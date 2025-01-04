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

        const core=Bodies.rectangle(
            robot.getX() + relativeX,
            robot.getY() + relativeY,
            wheelWidth,
            wheelHeight, {
            render: {
                fillStyle: "#2F2F2F", // real color of our robot
                visible: false
            },

            collisionFilter: {
                group: -1,
                category: 2,
                mask: 0,
            },
        });

        const stiffness=0.6;

        const pin = Constraint.create({
            bodyA: robot.body,
            pointA: {x: relativeX, y: relativeY},

            bodyB: core,
            pointB: {x: 0, y: 0},
            stiffness: stiffness,
            length: 0,

            render: {
                visible: true
            },
        });

        super(core, wheelWidth, wheelHeight);

        this.speed = 0;
        this.direction = 1;

        this.bodyArray = [core, pin];

        this.robot = robot;
    }

    setDirection(direction) {
        this.direction = direction;
    }

    setSpeed(speed, duration=1000) {
        this.speed = speed/3;
        let delta=0;

        clearInterval(this.movingInterval);
        if (this.speed > 0) {  // The robot starts moving
            Body.setStatic(this.body, false);
            this.movingInterval = setInterval(() => {
                this.moving();
                delta += 10;

                if(delta >= duration){
                    clearInterval(this.movingInterval); //End of duration, the robot stops executing the order
                }
            }, 10);
        }
        else if(!this.body.isStatic) {
            Body.setStatic(this.body, true);
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