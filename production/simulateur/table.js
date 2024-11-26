import {Engine, Render, Runner,Body ,Mouse, MouseConstraint, width, height, Composite} from "./global.js";

let engine, runner, render;

class Table{
    constructor(robots, balls, holes){
        this.robots=robots;
        this.balls=balls;
        this.holes=holes;
    }

    setup(){
        const canvasContainer=document.getElementById("canvas-container");

        engine=Engine.create(); 
        engine.gravity.y=0;
      
        runner= Runner.create(); 
        render = Render.create({
          element: canvasContainer,
          engine: engine,
          options: {
            width: width,
            height: height,
            wireframes: false,
            background: "green"
          }
        });

        const mouse = Mouse.create(render.canvas); // Création de la souris sur le canvas
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 1,
                render: {
                    visible: false
                }
            }
        });

        Composite.add(engine.world, mouseConstraint);
        render.mouse = mouse;

        this.addObjectsToEnv();

        Render.run(render);
        Runner.run(runner, engine);

        Matter.Events.on(mouseConstraint, "enddrag", (event) => {
            const body = event.body;
            if (body) {
                Body.setVelocity(body, { x: 0, y: 0});
            }
        });
    }

    addObjectsToEnv(){
        this.balls.forEach(ball => {
            console.log(ball);
            ball.addToEnv(engine.world);
        });

        this.robots.forEach(robot => {
            robot.addToEnv(engine.world);
        });

        this.holes.forEach(hole => {
            hole.addToEnv(engine.world);
        });
    }
}

export default Table;