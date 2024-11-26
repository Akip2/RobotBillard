import { Body, Composite } from "../global.js";

class SimulationObject{
    constructor(body,w, h, x=0, y=0){
        this.body=body;
        this.width=w;
        this.height=h;

        this.place(x, y);
    }

    place(x, y){
        Body.setPosition(this.body, { x: x, y: y});
    }

    getPosition(){
        return this.body.position;
    }

    getX(){
        return this.getPosition.x;
    }

    getY(){
        return this.getPosition.y;
    }

    addToEnv(world){
        Composite.add(world, this.body);
    }
}

export default SimulationObject;