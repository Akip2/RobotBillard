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
                pixelRatio: 1
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
        this.canvasContext = this.canvas.getContext("2d", {willReadFrequently: true});

        this.updateLoop = this.createUpdateLoop(simulatorSpeed);

        this.overlay = document.createElement("canvas");
        this.overlay.width = width;
        this.overlay.height = height;
        this.overlay.style.pointerEvents = "none";
        this.overlay.style.backgroundImage = "none";

        this.overlayContext = this.overlay.getContext("2d",{willReadFrequently: true});

        this.canvasContainer.appendChild(this.overlay);

        Matter.Events.on(this.render, 'afterRender', () => {
            this.robots.forEach(robot => {
                Body.setAngle(robot.aruco, robot.getAngle());
                Body.setPosition(robot.aruco, robot.getPosition());
            });

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

        this.robots = robots;

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
        // si on ne veut pas tracer les cercles, on s'arrête juste apres le nettoyage du canvas
        if (afficherDessins) {
            ballsPositions.forEach((ballPosition) => {
                this.overlayContext.lineWidth = 4;

                this.overlayContext.beginPath();
                this.overlayContext.strokeStyle = "lime";
                this.overlayContext.arc(ballPosition.x, ballPosition.y, 1, 0, 2 * Math.PI);
                this.overlayContext.stroke();
                this.overlayContext.closePath();

                this.overlayContext.beginPath();
                this.overlayContext.strokeStyle = "blue";
                this.overlayContext.arc(ballPosition.x, ballPosition.y, ballRadius, 0, 2 * Math.PI);
                this.overlayContext.stroke();
                this.overlayContext.closePath();
            });
        }
    }

    drawDetectedArucos(robotArucos) {
        this.overlayContext.clearRect(0, 0, this.overlay.width, this.overlay.height);

        if(afficherDessins) {
            robotArucos.forEach((robotAruco) => {
                const position = robotAruco.position;
                this.overlayContext.fillStyle = "red";
                this.overlayContext.fillRect(position.x-5, position.y-5, 10, 10);
            });
        }
    }

    generateNoise() {
        const imageData = this.canvasContext.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;

        for (let i = 0; i < pixels.length; i += (9 - noise)) {
            let noise = (Math.random() - 0.5) * 100;
            pixels[i] += noise;
            pixels[i + 1] += noise;
            pixels[i + 2] += noise;
        }

        this.canvasContext.putImageData(imageData, 0, 0);
    }

    changeSpeed() {
        clearInterval(this.updateLoop);
        this.updateLoop = this.createUpdateLoop(simulatorSpeed);
    }
}

export default VueSimulateur;
