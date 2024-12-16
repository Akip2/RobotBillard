import {Bodies, Body, COLLISION_FILTERS, Composite, Constraint} from "../global.js";
import SimulationObject from "./simulation-object.js";
import Wheel from "./wheel.js";

class Robot extends SimulationObject{
    constructor(width, height, wheelRadius, x=0, y=0){
        const core=Bodies.rectangle(0, 0, width, height, {
            render: {
              fillStyle : "#B6423F" // real color of our robot
            },
        });

        const wheel1=new Wheel(wheelRadius, -width/2, (height/2)-wheelRadius);
        const wheel2=new Wheel(wheelRadius, width/2, (height/2)-wheelRadius);

        wheel1.body.collisionFilter = {
            'group': -1,
            'category': 2,
            'mask': 0,
        };

        wheel2.body.collisionFilter = {
            'group': -1,
            'category': 2,
            'mask': 0,
        };

        const pin1 = Constraint.create({
            bodyA: core,
            pointA: { x: -width/2, y:  (height/2)-wheelRadius},
            bodyB: wheel1.body,
            pointB: { x: 0, y: 0 },
            stiffness: 0.9,
            length: 0
        });

        const pin2 = Constraint.create({
            bodyA: core,
            pointA: { x: width/2, y:  (height/2)-wheelRadius},
            bodyB: wheel2.body,
            pointB: { x: 0, y: 0 },
            stiffness: 0.9,
            length: 0
        });

        super(core, width, height, x, y);

        this.wheelLeft=wheel1;
        this.wheelRight=wheel2;

        this.bodyArray=[core, pin1, wheel1.body, pin2, wheel2.body];
    }

    move(leftSpeed, leftTime, rightSpeed, rightTime){
        if(leftSpeed<0){
            this.wheelLeft.setDirection(-1);
        }
        else{
            this.wheelLeft.setDirection(1);
        }

        if(rightSpeed<0){
            this.wheelRight.setDirection(-1);
        }
        else{
            this.wheelRight.setDirection(1);
        }

        this.wheelLeft.setSpeed(leftSpeed);
        this.wheelRight.setSpeed(rightSpeed);

        /*
        this.movingInterval=setInterval(()=>{
            console.log(this.body.parts[1].velocity);
        }, 1000);
         */
    }

    addToEnv(world) {
        this.bodyArray.forEach((element) => {
            Composite.add(world, element);
        })
    }
}

export default Robot;