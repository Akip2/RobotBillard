import { Engine, Render,Runner, width, height} from "./global.js";

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

        this.addObjectsToEnv();

        Render.run(render);
        Runner.run(runner, engine);
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