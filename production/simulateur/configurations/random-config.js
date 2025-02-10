import Table from "../table.js";
import Robot from "../objects/robot.js";
import {
    ballColors,
    ballRadius,
    height,
    holeRadius,
    robotHeight,
    robotWidth,
    wallSize,
    wheelHeight,
    wheelWidth,
    width
} from "../params.js";
import Ball from "../objects/ball.js";

class RandomConfig extends Table {
    constructor(vue) {
        let randomWidth = Math.random() * width;
        let randomHeight = Math.random() * height;
        const robots = [new Robot(
            robotWidth, robotHeight, wheelWidth, wheelHeight,

            // Vérifie que l'abscisse du robot n'est pas dans un mur ou en dehors de l'écran
            randomWidth < (robotWidth / 2) + wallSize
                ? (robotWidth / 2 + wallSize)
                : randomWidth > (width - robotWidth / 2 - wallSize)
                    ? width - robotWidth / 2 - wallSize
                    : randomWidth,

            // Vérifie que l'ordonnée du robot n'est pas dans un mur ou en dehors de l'écran
            randomHeight < (robotHeight / 2) + wallSize
                ? (robotHeight / 2 + wallSize)
                : randomHeight > (height - robotHeight / 2 - wallSize)
                    ? height - robotHeight / 2 - wallSize
                    : randomHeight
        )];

        const balls = [];
        ballColors.forEach(color => {
            let ballFull = new Ball(
                ballRadius,
                color,
                (Math.random() * (width - holeRadius * 2)) + holeRadius,
                Math.random() * (height - holeRadius * 2) + holeRadius
            );

            let ballCircled = new Ball(
                ballRadius,
                color,
                (Math.random() * (width - holeRadius * 2)) + holeRadius,
                Math.random() * (height - holeRadius * 2) + holeRadius,
                true
            );

            balls.push(ballFull, ballCircled);
        });

        let ballWhite = new Ball(
            ballRadius,
            "white",
            (Math.random() * (width - holeRadius * 2)) + holeRadius,
            Math.random() * (height - holeRadius * 2) + holeRadius
        );
        let ballBlack = new Ball(
            ballRadius,
            "rgb(17,17,17)",
            (Math.random() * (width - holeRadius * 2)) + holeRadius,
            Math.random() * (height - holeRadius * 2) + holeRadius
        );

        balls.push(ballWhite, ballBlack);

        super(robots, balls, vue);
    }
}

export default RandomConfig;
