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
        let randomWidth=Math.random()*width;
        let randomHeight=Math.random()*height;
        const robots=[new Robot(
            robotWidth, robotHeight, wheelSize,

            //Verifie que l'abscisse du robot n'est pas dans un mur ou en dehors de l'écran
            randomWidth<(robotWidth/2)+wallSize
                ? (robotWidth/2+wallSize)
                : randomWidth>(width-robotWidth/2-wallSize)
                    ? width-robotWidth/2-wallSize
                    : randomWidth,

            //Verifie que l'ordonnée du robot n'est pas dans un mur ou en dehors de l'écran
            randomHeight<(robotHeight/2)+wallSize
                ? (robotHeight/2+wallSize)
                : randomHeight>(height-robotHeight/2-wallSize)
                    ? height-robotHeight/2-wallSize
                    : randomHeight
        )];

        const balls=[];
        ballColors.forEach(color=>{
            let ballFull=new Ball(
                ballSize,
                color,
                false,
                (Math.random()*(width-holeSize*2))+holeSize,
                Math.random()*(height-holeSize*2)+holeSize
            );

            let ballCircled=new Ball(
                ballSize,
                color,
                true,
                (Math.random()*(width-holeSize*2))+holeSize,
                Math.random()*(height-holeSize*2)+holeSize
            );

            balls.push(ballFull, ballCircled);
        });

        super(robots, balls, vue);
    }
}

export default RandomConfig;