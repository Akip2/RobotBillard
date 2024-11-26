import { Bodies, Body} from "../global.js";
import SimulationObject from "./simulation-object.js";
import Wheel from "./wheel.js";

class Robot extends SimulationObject{
    constructor(width, height, wheelRadius, x=0, y=0){
        const core=Bodies.rectangle(0, 0, width, height, {
            render: {
              fillStyle : "gray"
            }
        });

        const wheel1=new Wheel(wheelRadius, -width/2, (height/2)-wheelRadius);
        const wheel2=new Wheel(wheelRadius, width/2, (height/2)-wheelRadius);

        const body=Body.create({
            parts: [wheel1.body, wheel2.body, core],
        });

        super(body, width, height, x, y);

        this.wheelLeft=wheel1;
        this.wheelRight=wheel2;
    }
}

export default Robot;