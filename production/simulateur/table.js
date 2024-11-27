import {Engine, Render, Runner,Body ,Mouse, MouseConstraint, Composite} from "./global.js";
import Wall from "./objects/wall.js";
import {width, height, holeSize} from "./params.js";
import Hole from "./objects/hole.js";

let engine, runner, render;

const walls= [
    new Wall(5, height, 2.5, height/2),
    new Wall(5, height, width-2.5, height/2),
    new Wall(width, 5, width/2, height-2.5),
    new Wall(width, 5, width/2, 2.5),
];

const holes=[
    new Hole(holeSize,holeSize/2, height-holeSize/2),
    new Hole(holeSize, holeSize/2, holeSize/2),
    new Hole(holeSize, width/2, holeSize/2),
    new Hole(holeSize, width-holeSize/2, holeSize/2),
    new Hole(holeSize, width-holeSize/2, height-holeSize/2),
    new Hole(holeSize, width/2, height-holeSize/2)
]

class Table{
    constructor(robots, balls){
        this.robots=robots;
        this.balls=balls;
    }

    addObjectsToEnv(){
        this.balls.forEach(ball => {
            console.log(ball);
            ball.addToEnv(engine.world);
        });

        this.robots.forEach(robot => {
            robot.addToEnv(engine.world);
        });

        holes.forEach(hole => {
            hole.addToEnv(engine.world);
        });

        walls.forEach(wall => {
            wall.addToEnv(engine.world);
        })
    }
}

export default Table;