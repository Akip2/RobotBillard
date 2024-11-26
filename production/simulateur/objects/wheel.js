import { Bodies} from "../global.js";
import SimulationObject from "./simulation-object.js";

class Wheel extends SimulationObject{
    constructor(radius, x=0, y=0){
        const body=Bodies.circle(0, 0, radius, { 
            render: {
              fillStyle : "darkslategray"
            }
        });

        super(body, radius*2, radius*2, x, y);

        this.speed=0;
        this.direction=1;
    }
}

export default Wheel;