import {Body, Composite} from "../global.js";

class SimulationObject {
    constructor(body, w, h) {
        this.body = body;
        this.width = w;
        this.height = h;

        //this.place(x, y);
    }

    place(x, y) {
        Body.setPosition(this.body, {x: x, y: y});
    }

    getPosition() {
        return this.body.position;
    }

    getX() {
        return this.getPosition().x;
    }

    getY() {
        return this.getPosition().y;
    }

    getAngle() {
        return this.body.angle;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    addToEnv(world) {
        Composite.add(world, this.body);
    }

    destroy(world) {
        Composite.remove(world, this.body);
    }
}

export default SimulationObject;
