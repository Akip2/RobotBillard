import {getXYD, arucos} from "./aruco_detect.js";
import {circles_array} from "./detectingCircles.js";
import {billard, getTrous} from "./billard.js";

let socket = io();
let robots = arucos;
let positionsBalls = JSON.parse(JSON.stringify(circles_array));
let ballSelected = undefined;
let showTrajectory = false;

// if new frame is available then process it
let video = document.getElementById("video");

const displayPaths = (robot, positionsBalls, ballSelected) => {

    let canvas = document.getElementById("canvasOutput");
    let ctx = canvas.getContext("2d");
    // Robot get position

    let xRobot = (robot.corners[0].x + robot.corners[2].x) / 2
    let yRobot = (robot.corners[1].y + robot.corners[3].y) / 2

    // Draw on canvas lines between robot and ballSelected
    let xSelectedBall = ballSelected.x;
    let ySelectedBall = ballSelected.y;
    // Get norm of vector
    let norm = document.getElementById("slideVelocity").value;
    let vxRobot = norm * Math.cos(Math.atan2(ySelectedBall - yRobot, xSelectedBall - xRobot)) * 10;
    let vyRobot = norm * Math.sin(Math.atan2(ySelectedBall - yRobot, xSelectedBall - xRobot)) * 10;

    ctx.beginPath();
    ctx.moveTo(xRobot, yRobot);

    ctx.lineTo(xSelectedBall, ySelectedBall);
    ctx.strokeStyle = "red";
    ctx.stroke();
    ctx.closePath();


    // Create vector between robot and ballSelected
    let vectorVelocity = [0, 0];
    let ballsCopy = JSON.parse(JSON.stringify(positionsBalls));

    // get index of ballSelected
    let indexBallSelected = ballsCopy.indexOf(ballsCopy.filter(ball => {
        return ball.x === ballSelected.x && ball.y === ballSelected.y;
    })[0]);

    // Initiate vector of velocity
    ballsCopy.forEach(ball => {
        if (ball.x === ballSelected.x && ball.y === ballSelected.y) {
            let vector = [ball.x - xRobot, ball.y - yRobot];
            let normVector = Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
            vectorVelocity = [vector[0] / normVector * norm, vector[1] / normVector * norm];
            ball.vx = vectorVelocity[0];
            ball.vy = vectorVelocity[1];
        } else {
            ball.vx = 0;
            ball.vy = 0;
        }
    })

    for (let i = 0; i < 300; i++) {
        ballsCopy.forEach(ball => {
            let border = billard.border;
            // collision avec les bords
            if (collisionBorder(ball, border)) {
                if (ball.x < border[0][0] || ball.x > border[2][0]) {
                    ball.vx = -ball.vx;
                }

                if (ball.y < border[0][1] || ball.y > border[2][1]) {
                    ball.vy = -ball.vy;
                }
            }

            // collision avec les autres balles
            ballsCopy.forEach(ball2 => {
                if (ball !== ball2) {
                    if (checkCollisionBetweenBalls(ball, ball2)) {
                        let [vx1, vy1, vx2, vy2] = elasticCollision(ball, ball2);
                        ball.vx = vx1;
                        ball.vy = vy1;
                        ball2.vx = vx2;
                        ball2.vy = vy2;
                    }
                }

            })

            // update position of balls and drag
            ctx.beginPath();
            ctx.moveTo(ball.x, ball.y);
            ball.x += ball.vx;
            ball.y += ball.vy;
            ctx.lineTo(ball.x, ball.y);
            if (ball === ballsCopy[indexBallSelected]) {
                ctx.strokeStyle = "red";
                ctx.stroke();
            } else {
                if (showTrajectory) {
                    ctx.strokeStyle = "purple";
                    ctx.stroke();
                }
            }
            ctx.closePath();
        })


    }
}

const elasticCollision = (balle1, balle2) => {
    let m1 = 1;
    let m2 = 1;
    let totalMass = m1 + m2;

    // Calcul des composantes des vitesses finales selon x et y
    let vx1 = ((m1 - m2) / totalMass) * balle1.vx + ((2 * m2) / totalMass) * balle2.vx;
    let vy1 = ((m1 - m2) / totalMass) * balle1.vy + ((2 * m2) / totalMass) * balle2.vy;

    let vx2 = ((2 * m1) / totalMass) * balle1.vx + ((m2 - m1) / totalMass) * balle2.vx;
    let vy2 = ((2 * m1) / totalMass) * balle1.vy + ((m2 - m1) / totalMass) * balle2.vy;

    return [vx1, vy1, vx2, vy2];
}
const checkCollisionBetweenBalls = (balle1, balle2) => {
    let d = Math.sqrt(Math.pow(balle1.x - balle2.x, 2) + Math.pow(balle1.y - balle2.y, 2));
    if (d < balle1.radius / 2 + balle2.radius / 2) {
        return true;
    }
    return false;
}
const collisionBorder = (ball, border) => {
    if (ball.x < border[0][0] || ball.x > border[2][0] || ball.y < border[0][1] || ball.y > border[2][1]) {
        return true;
    }
}
const drawBallSelected = (ball) => {
    let canvas = document.getElementById("canvasOutput");
    let ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
}
// event on mouse click
document.getElementById("canvasOutput").addEventListener("click", function (e) {
    let canvas = document.getElementById("canvasOutput");
    let rect = canvas.getBoundingClientRect();
    let mouse_x = e.clientX - rect.left;
    let mouse_y = e.clientY - rect.top;
    positionsBalls = JSON.parse(JSON.stringify(circles_array));
    // detect if click is on a ball
    for (let i = 0; i < positionsBalls.length; i++) {
        let ball = positionsBalls[i];
        let d = Math.sqrt(Math.pow(mouse_x - ball.x, 2) + Math.pow(mouse_y - ball.y, 2));
        if (d < ball.radius && ballSelected === undefined) {
            console.log("click on ball " + i);
            ballSelected = JSON.parse(JSON.stringify(ball));
            console.log("Trous ::: " + getTrous());
            socket.emit('selectedBall', ballSelected.x + " " + ballSelected.y + " " + getTrous());
        }else if(d < ball.radius && ballSelected !== undefined){
            ballSelected = undefined;
            socket.emit('selectedBall', "undefined");
        }
    }




});
// Bouton affichage trajectoire
document.getElementById("btnTrajectory").addEventListener("click", function (e) {
    showTrajectory = !showTrajectory;
    if (showTrajectory) {
        document.getElementById("btnTrajectory").innerHTML = "Cacher trajectoire";
    } else {
        document.getElementById("btnTrajectory").innerHTML = "Afficher trajectoire";
    }
})

export function getBallSelected() {
    if (ballSelected !== undefined) {
        return ballSelected.x + " " + ballSelected.y;
    }
}


function tick() {
    requestAnimationFrame(tick);
    let robot = arucos[0];
    let positionsBalls = circles_array;

    if (ballSelected !== undefined) {
        drawBallSelected(ballSelected);
    }

    if (arucos !== undefined && positionsBalls !== undefined && ballSelected !== undefined) {
        displayPaths(robot, positionsBalls, ballSelected);
    }


}


requestAnimationFrame(tick);