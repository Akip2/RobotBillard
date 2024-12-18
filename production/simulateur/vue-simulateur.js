import {Body, Composite, Engine, Mouse, MouseConstraint, Render, Runner, World,} from "./global.js";
import {height, width} from "./params.js";

class VueSimulateur {
    constructor(canvasContainer) {
        this.canvasContainer = canvasContainer;

        this.createEngine();
        this.createMouse();
    }

    createEngine() {
        this.engine = Engine.create();
        this.engine.gravity.y = 0;

        this.runner = Runner.create();
        this.render = Render.create({
            element: this.canvasContainer,
            engine: this.engine,
            options: {
                width: width,
                height: height,
                wireframes: false,
                background: "grey", // grey of our table
            },
        });

        this.render.canvas.id = "canvas-simulateur";
    }

    createMouse() {
        this.mouse = Mouse.create(this.render.canvas); // Creation of the mouse ON the canvas
        this.mouseConstraint = MouseConstraint.create(this.engine, {
            mouse: this.mouse,
            constraint: {
                stiffness: 1,
                render: {
                    visible: false,
                },
            },
        });

        Composite.add(this.engine.world, this.mouseConstraint);
        this.render.mouse = this.mouse;

        Matter.Events.on(this.mouseConstraint, "enddrag", (event) => {
            const body = event.body;
            if (body) {
                Body.setVelocity(body, {x: 0, y: 0});
            }
        });
    }

    run() {
        Render.run(this.render);
        Runner.run(this.runner, this.engine);
    }

    setup(table) {
        const balls = table.balls;
        const holes = table.holes;
        const walls = table.walls;
        const robots = table.robots;

        this.addObjects(walls);
        this.addObjects(holes);
        this.addObjects(robots);
        this.addObjects(balls);
    }

    addObjects(objArray) {
        objArray.forEach((obj) => {
            obj.addToEnv(this.engine.world);
        });
    }

    removeBall(ballBody) {
        Composite.remove(this.engine.world, ballBody);
    }

    clearSimulation() {
        World.clear(this.engine.world);
        Engine.clear(this.engine);
        Render.stop(this.render);
        Runner.stop(this.runner);
        this.render.canvas.remove();
        this.render.canvas = null;
        this.render.context = null;

        Composite.clear(this.engine.world, false);
    }
}

export default VueSimulateur;
