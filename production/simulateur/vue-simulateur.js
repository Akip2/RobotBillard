import {Body, Composite, Engine, Mouse, MouseConstraint, Render, Runner} from "./global.js";
import {height, width} from "./params.js";

class VueSimulateur {
    constructor(canvasContainer){
        this.canvasContainer = canvasContainer;
        this.objects=[];
    }

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

    run(){
        Render.run(this.render);
        Runner.run(this.runner, this.engine);
    }

    addToView(obj){
        obj.addToEnv(this.engine.world);
        this.objects.push(obj);
    }

    removeFromView(obj){
        obj.destroy(this.engine.world);
        this.objects.splice(this.objects.indexOf(obj), 1);
    }

    create(table){
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

    update(table){
        const balls=table.balls;
        const holes=table.holes;
        const walls=table.walls;
        const robots=table.robots;

        this.objects.forEach((obj) =>{
            if(!(balls.includes(obj) || holes.includes(obj) || walls.includes(obj)) || robots.includes(obj) || walls.includes(obj)) {
                this.removeFromView(obj);
            }
        });

        this.addObjects(balls);
        this.addObjects(holes);
        this.addObjects(walls);
        this.addObjects(robots);
    }

    addObjects(objArray){
        objArray.forEach(obj => {
            if(!this.objects.includes(obj)){
                this.addToView(obj);
            }
        })
    }
}

export default VueSimulateur;