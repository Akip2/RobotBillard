import {distanceBetweenPoints} from "../brain/brain.js";
import {getRealHoles} from "../video/video-functions.js";

export function getNearestBall(balls, robotPosition) {
    let nearestBall = balls[0];
    let minDistance = distanceBetweenPoints(nearestBall, robotPosition);

    for (let i = 1; i < balls.length; i++) {
        let distance = distanceBetweenPoints(balls[i], robotPosition);

        if (distance < minDistance) {
            nearestBall = balls[i];
            minDistance = distance;
        }
    }
    return nearestBall;
}

export function getNearestBallToHoles(holes, balls) {
    let closestHole;
    let closestBall;
    let minDist = Number.POSITIVE_INFINITY;

    balls.forEach((ball) => {
        holes.forEach((hole) => {
            let currentDist = distanceBetweenPoints(hole, ball);

            if (currentDist < minDist) {
                closestBall = ball;
                closestHole = hole;
                minDist = currentDist;
            }
        })
    });

    return [closestBall, closestHole];
}

export function getNearestHole(holes, ball) {
    let nearestHole = holes[0];
    let minDistance = distanceBetweenPoints(nearestHole, ball);

    for (let i = 1; i < holes.length; i++) {
        let distance = distanceBetweenPoints(holes[i], ball);

        if (distance < minDistance) {
            nearestHole = holes[i];
            minDistance = distance;
        }
    }
    return nearestHole;
}

export function getAlignPositionToPush(ballToPush) {
    let holes = getRealHoles();

    console.log(holes);

}

export function normalize(vector) {
    const norm = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));

    return {
        x: vector.x / norm,
        y: vector.y / norm
    }
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function isEmpty(tab) {
    return tab.length === 0;
}