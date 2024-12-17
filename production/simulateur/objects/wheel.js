import { Bodies, Body} from "../global.js";
import SimulationObject from "./simulation-object.js";

class Wheel extends SimulationObject{
    constructor(radius, x=0, y=0){
        const body=Bodies.circle(x, y, radius, {
            render: {
              fillStyle : "#2F2F2F" // couleur réelle de notre robot
            },

            collisionFilter: {
                group: -1,
                category: 2,
                mask: 0,
            }
        });

        super(body, radius*2, radius*2);

        this.speed=0;
        this.direction=1;
        this.isMoving=false;
    }

    setDirection(direction){
        this.direction=direction;
    }

    setSpeed(speed){
        this.speed=speed;

        if(this.isMoving && this.speed===0){  //Stops the robot
            clearInterval(this.movingInterval);
        }
        else if(!this.isMoving && this.speed>0){  //The robot starts moving
            this.movingInterval=setInterval(()=>{
                //console.log(this.body.angle);
                this.moving();
            }, 10);
        }
    }

    moving(){
        console.log("moving");

        //Body.setVelocity(this.body, {x:0, y:(this.speed*this.direction)});

        //Body.setAngle(this.body, this.body.angle+1);
    }
}

export default Wheel;