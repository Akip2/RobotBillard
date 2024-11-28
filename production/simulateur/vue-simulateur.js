import {Body, Composite, Engine, Mouse, MouseConstraint, Render, Runner} from "./global.js";
import {height, width} from "./params.js";

class VueSimulateur{
    constructor(canvasContainer){
        this.canvasContainer=canvasContainer;
        this.setup();
    }

    update(table){
        table.balls.forEach(ball => {
            ball.addToEnv(this.engine.world);
        });

        table.robots.forEach(robot => {
            robot.addToEnv(this.engine.world);
        });

        table.holes.forEach(hole => {
            hole.addToEnv(this.engine.world);
        });

        table.walls.forEach(wall => {
            wall.addToEnv(this.engine.world);
        })
    }

    /**
     * Setup Matter.js canvas + run simulation
     */
    setup(){
        this.engine=Engine.create();
        this.engine.gravity.y=0;

        this.runner= Runner.create();
        this.render = Render.create({
            element: this.canvasContainer,
            engine: this.engine,
            options: {
                width: width,
                height: height,
                wireframes: false,
                background: "green"
            }
        });

        this.setupMouse();

        Render.run(this.render);
        Runner.run(this.runner, this.engine);
    }

    setupMouse(){
        this.mouse = Mouse.create(this.render.canvas); // Création de la souris sur le canvas
        this.mouseConstraint = MouseConstraint.create(this.engine, {
            mouse: this.mouse,
            constraint: {
                stiffness: 1,
                render: {
                    visible: false
                }
            }
        });

        Composite.add(this.engine.world, this.mouseConstraint);
        this.render.mouse = this.mouse;

        Matter.Events.on(this.mouseConstraint, "enddrag", (event) => {
            const body = event.body;
            if (body) {
                Body.setVelocity(body, { x: 0, y: 0});
            }
        });
    }
}

export default  VueSimulateur;
