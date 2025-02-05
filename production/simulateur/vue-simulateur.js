import {Body, Composite, Engine, Mouse, MouseConstraint, Render, Runner, World,} from "./global.js";
import {height, width, ballRadius} from "./params.js";

class VueSimulateur {
    constructor(canvasContainer) {
        this.canvasContainer = canvasContainer;

        this.createEngine();
        this.createMouse();

        this.isRunning = false;
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
                Body.setAngularVelocity(body, 0);
            }
        });
    }

    run() {
        this.isRunning = true;
        Render.run(this.render);
        Runner.run(this.runner, this.engine);

        this.overlay = document.createElement("canvas");
        this.overlay.width = width;
        this.overlay.height = height;
        this.overlay.style.pointerEvents="none";
        this.overlay.style.backgroundImage = "none";

        this.canvasContainer.appendChild(this.overlay);
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
        this.isRunning = false;
        World.clear(this.engine.world);
        Engine.clear(this.engine);
        Render.stop(this.render);
        Runner.stop(this.runner);
        this.render.canvas.remove();
        this.render.canvas = null;
        this.render.context = null;
        this.overlay.remove();

        Composite.clear(this.engine.world, false);
    }

    drawDetectedCircles(ballsPositions) {
        const ctx = this.overlay.getContext("2d");
        ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);

        ballsPositions.forEach((ballPosition) => {
            ctx.fillStyle = "yellow";

            ctx.beginPath();
            ctx.arc(ballPosition.x, ballPosition.y, ballRadius, 0, 2 * Math.PI);
            ctx.stroke()
        })
    }
}

export default VueSimulateur;
