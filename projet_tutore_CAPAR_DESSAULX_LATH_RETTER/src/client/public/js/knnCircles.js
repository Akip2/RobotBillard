import {circles_array as positionCircles} from "./detectingCircles.js";
import {billard} from "./billard.js";

let border = billard.border;
let data = [];
/*
    Fonction retournant l'identité de la balle en fonction de la moyenne de ses couleurs
 */
const knnColor = (color,data) => {
    let closestColor = +Infinity;
    let id = -1;
    for (let i = 0; i < data.length; i++) {
        let ball = data[i];
        let distance = Math.sqrt(Math.pow(color[0] - ball.color[0], 2) + Math.pow(color[1] - ball.color[1], 2) + Math.pow(color[2] - ball.color[2], 2));
        if (distance < closestColor) {
            closestColor = distance;
            id = ball.id;
        }
    }
    return id;
}
/*
    Fonction permettant d'initialiser les balles et la moyenne de leurs couleurs dans un tableau
 */

const initData = (balls) => {
    let data = [];
    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];
        // if in the billard

        if (ball.x > border[0][0] && ball.x < border[2][0] && ball.y > border[0][1] && ball.y < border[2][1]) {
            let color = getAverageColor(ball);
            data.push({id: i, color: color});
        }

    }
    return data;
}

const getAverageColor = (ball) => {
    // position of the ball
    let x = ball.x;
    let y = ball.y;
    let radius = ball.radius;

    // get canvas
    let canvas = document.getElementById("canvasOutput");
    let ctx = canvas.getContext("2d");
    let imageData = ctx.getImageData(x - radius, y - radius, radius * 2, radius * 2);
    let data = imageData.data;

    // get average color
    let R = 0;
    let G = 0;
    let B = 0;
    let A = 0;
    for (let i = 0; i < data.length; i += 4) {
        R += data[i];
        G += data[i + 1];
        B += data[i + 2];
        A += data[i + 3];
    }

    R = R / (data.length / 4);
    G = G / (data.length / 4);
    B = B / (data.length / 4);
    A = A / (data.length / 4);
    return [R, G, B, A];
}

// rgb vers nuance de gris
const rgbToGray = (color) => {
    return 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2];
}

let button = document.getElementById("btnKnn");
button.addEventListener("click", function (e) {
    data = initData(positionCircles);
    let knnDiv = document.getElementById("knn");
    let str = "<table><tr><th>id</th><th>color</th></tr>";

    data.forEach(ball => {
        str += "<tr><td>" + ball.id + "</td><td>" + ball.color + "</td></tr>";
    })
   str += "</table>";
    knnDiv.innerHTML = str;
});

const drawId = (id,x,y) => {
    let canvas = document.getElementById("canvasOutput");
    let ctx = canvas.getContext("2d");
    // afficher l'id de la balle sur le canvas
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 1;
    ctx.strokeText(id, x, y);


}

const tick = () => {
    requestAnimationFrame(tick);
    data.forEach(ball => {
        // knn
        let color = getAverageColor(positionCircles[ball.id]);
        let id = knnColor(color,data);
        drawId(id,positionCircles[ball.id].x,positionCircles[ball.id].y);
    })
}


requestAnimationFrame(tick);