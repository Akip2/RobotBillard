import {ballColors, ballRadius, height, width} from "../params.js";
import Ball from "../objects/ball.js";

export function placerBoulesBillardConfiguration() {
    const balls = [];

    let x = width / 4 * 3;
    let y = height / 2;
    let nbCol = 5;

    // White ball
    balls.push(new Ball(ballRadius, "white", width / 2, height / 2));

    for (let i = 0; i <= nbCol; i++) {
        for (let j = 0; j < i; j++) {
            let ball = new Ball(ballRadius, ballColors[
                Math.floor(Math.random() * 7)
                ], x, y, (Math.random() * 2) < 1);
            balls.push(ball);

            y += ballRadius * 2;
        }

        y = height / 2 - (i * ballRadius);
        x += ballRadius * 2 - 3;
    }

    return balls;
}
