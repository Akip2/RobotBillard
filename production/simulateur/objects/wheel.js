import { Bodies, Body} from "../global.js";
import SimulationObject from "./simulation-object.js";

class Wheel extends SimulationObject{
    constructor(radius, x=0, y=0){
        const body=Bodies.circle(0, 0, radius, {
            render: {
              fillStyle : "#2F2F2F" // couleur réelle de notre robot
            }
        });

        super(body, radius*2, radius*2, x, y);

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
                this.moving()
            }, 10);
        }
    }

    moving(){
        console.log("moving");

        //Body.setPosition(this.body, {x:this.getX()+1, y:this.getY()});
        //Body.setVelocity(this.body, {x:0, y:(this.speed*this.direction)});

        const force = {
            x: 1000, // Force sur l'axe X
            y: 0,              // Pas de force sur l'axe Y
        };


        //Body.applyForce(this.body, this.body.position, force);
    }
}

export default Wheel;