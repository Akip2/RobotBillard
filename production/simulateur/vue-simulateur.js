import {Body, Composite, Engine, Mouse, MouseConstraint, Render, Runner} from "./global";
import {height, width} from "./params";

class VueSimulateur{
    constructor(canvasContainer){
        this.canvasContainer=canvasContainer;
    }

    /**
     * Setup Matter.js canvas + run simulation
     */
    setup(){
        this.engine=Engine.create();
        engine.gravity.y=0;

        this.runner= Runner.create();
        this.render = Render.create({
            element: this.canvasContainer,
            engine: engine,
            options: {
                width: width,
                height: height,
                wireframes: false,
                background: "green"
            }
        });

        this.setupMouse();

        Render.run(render);
        Runner.run(runner, engine);
    }

    setupMouse(){
        this.mouse = Mouse.create(render.canvas); // Création de la souris sur le canvas
        this.mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 1,
                render: {
                    visible: false
                }
            }
        });

        this.addElement(mouseConstraint);
        this.render.mouse = mouse;

        Matter.Events.on(mouseConstraint, "enddrag", (event) => {
            const body = event.body;
            if (body) {
                Body.setVelocity(body, { x: 0, y: 0});
            }
        });
    }

    addElement(element){
        Composite.add(this.engine.world, element);
    }
}

export default  VueSimulateur;
