import { Bodies} from "../global.js";
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
    }
}

export default Wheel;