import Table from "../table.js";
import Robot from "../objects/robot.js";
import {
    ballColors,
    ballSize,
    height,
    holeSize,
    robotHeight,
    robotWidth,
    wallSize,
    wheelSize,
    width
} from "../params.js";
import Ball from "../objects/ball.js";

class RandomConfig extends Table{
    constructor(vue){
        const robots=[new Robot(robotWidth, robotHeight, wheelSize, (Math.random()*(width-wallSize*2)-robotWidth*2)+robotWidth, (Math.random()*height-wallSize*2-robotHeight*2)+robotHeight)];

        const balls=[];
        ballColors.forEach(color=>{
            let ball=new Ball(ballSize, color, (Math.random()*(width-holeSize*2))+holeSize, Math.random()*(height-holeSize*2)+holeSize);
            balls.push(ball);
        });

        super(robots, balls, vue);
    }
}

export default RandomConfig;