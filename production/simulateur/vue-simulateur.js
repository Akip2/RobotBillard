import {Body, Composite, Engine, Mouse, MouseConstraint, Render, World,} from "./global.js";
import {ballRadius, height, simulatorFPS, width} from "./params.js";
import {afficherDessins, simulatorSpeed, noise} from "../js/events/parameters.js";

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

        this.canvas = this.canvasContainer.querySelector("#canvas-simulateur");

        this.updateLoop = this.createUpdateLoop(simulatorSpeed);

        this.overlay = document.createElement("canvas");
        this.overlay.width = width;
        this.overlay.height = height;
        this.overlay.style.pointerEvents = "none";
        this.overlay.style.backgroundImage = "none";

        this.canvasContainer.appendChild(this.overlay);

        Matter.Events.on(this.render, 'afterRender', () => {
            if(noise > 0) {
                this.generateNoise();
            }
        });
    }

    createUpdateLoop(speed) {
        if (speed > 0) {
            return setInterval(() => {
                Engine.update(this.engine, speed * 1000 / simulatorFPS);
            }, 1000 / (simulatorFPS * speed));
        }
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
        this.render.canvas.remove();
        this.render.canvas = null;
        this.render.context = null;
        this.overlay.remove();
        clearInterval(this.updateLoop);

        Composite.clear(this.engine.world, false);
    }

    drawDetectedCircles(ballsPositions) {
        const ctx = this.overlay.getContext("2d");
        ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);

        // si on ne veut pas tracer les cercles, on s'arrête juste apres le nettoyage du canvas
        if (afficherDessins) {
            ballsPositions.forEach((ballPosition) => {
                ctx.lineWidth = 4;

                ctx.beginPath();
                ctx.strokeStyle = "lime";
                ctx.arc(ballPosition.x, ballPosition.y, 1, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.closePath();

                ctx.beginPath();
                ctx.strokeStyle = "blue";
                ctx.arc(ballPosition.x, ballPosition.y, ballRadius, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.closePath();
            });
        }
    }

    generateNoise() {
        const ctx = this.canvas.getContext("2d");
        let imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let pixels = imageData.data;

        for (let i = 0; i < pixels.length; i += (9 - noise)) {
            let noise = (Math.random() - 0.5) * 100;
            pixels[i] += noise;
            pixels[i + 1] += noise;
            pixels[i + 2] += noise;
        }

        ctx.putImageData(imageData, 0, 0);
    }

    changeSpeed() {
        clearInterval(this.updateLoop);
        this.updateLoop = this.createUpdateLoop(simulatorSpeed);
    }
}

export default VueSimulateur;
