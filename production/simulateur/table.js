import Wall from "./objects/wall.js";
import {width, height, holeSize, wallSize} from "./params.js";
import Hole from "./objects/hole.js";
import wall from "./objects/wall.js";

class Table{
    constructor(robots, balls, vue){
        this.robots=robots;
        this.balls=balls;
        this.vue=vue;

        this.walls= [
            new Wall(wallSize, height, 2.5, height/2),
            new Wall(wallSize, height, width-2.5, height/2),
            new Wall(width, wallSize, width/2, height-2.5),
            new Wall(width, wallSize, width/2, 2.5),
        ];

        this.holes=[
            new Hole(holeSize, holeSize/2+wallSize/2, height-holeSize/2-wallSize/2),
            new Hole(holeSize, holeSize/2+wallSize/2, holeSize/2+wallSize/2),
            new Hole(holeSize, width/2+wallSize/2, holeSize/2+wallSize/2),
            new Hole(holeSize, width-holeSize/2-wallSize/2, holeSize/2+wallSize/2),
            new Hole(holeSize, width-holeSize/2-wallSize/2, height-holeSize/2-wallSize/2),
            new Hole(holeSize, width/2+wallSize/2, height-holeSize/2-wallSize/2)
        ];
    }

    removeBall(ball){
        let index=this.balls.indexOf(ball);
        this.balls.splice(index,1);

        this.notifyView();
    }

    getBalls(){
        return this.balls;
    }

    notifyView(){
        this.vue.update(this);
    }
}

export default Table;