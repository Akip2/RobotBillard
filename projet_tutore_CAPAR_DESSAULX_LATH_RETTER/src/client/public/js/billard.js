var socket = io();
class Billard {
    border = [];
    hole = [];

    constructor() {
        this.border = [];
        this.hole = [];
    }

}

let billard = new Billard();
let y_1 = 30;
let x_1 = 53;
let y_3 = 348;
let x_3 = 698;
let y_4 = 35;
let x_4 = 700;
let y_2 = 350;
let x_2 = 53;


billard.border.push([x_1, y_1]);
billard.border.push([x_2, y_2]);
billard.border.push([x_3, y_3]);
billard.border.push([x_4, y_4]);

// Defaut hole
for (let i = 1; i <= 6; i++) {
    billard.hole.push({x: 0, y: 0, radius: 0});
    document.getElementById("hole" + i + "x").value = 0;
    document.getElementById("hole" + i + "y").value = 0;
    document.getElementById("hole" + i + "radius").value = 0;
}


// config hole on canvas
const initButtonHole = () => {
    for (let i = 1; i <= 6; i++) {
        let buttonHole = document.getElementById("btnHole" + i);
        buttonHole.addEventListener("click", function (e) {
            //disable button
            buttonHole.disabled = true;
            // while canvas is not clicked
            document.getElementById("canvasOutput").addEventListener("click", function (e) {
                // get position of click
                // modifiy hole
                document.getElementById("hole" + i + "x").value = e.offsetX;
                console.log("hole" + i + "x")
                document.getElementById("hole" + i + "y").value = e.offsetY;
                billard.hole[i - 1].x = e.offsetX;
                billard.hole[i - 1].y = e.offsetY;
                buttonHole.disabled = false;
            },{once: true});


        });

    }
}


const eventInput = () => {
    for (let i = 1; i <= 6; i++) {
        let inputx = document.getElementById("hole" + i + "x");
        inputx.addEventListener("change", function (e) {
            billard.hole[i - 1].x = parseFloat(inputx.value);
        });
        let inputy = document.getElementById("hole" + i + "y");
        inputy.addEventListener("change", function (e) {
            billard.hole[i - 1].y = parseFloat(inputy.value);
        });
        let inputradius = document.getElementById("hole" + i + "radius");
        inputradius.addEventListener("change", function (e) {
            billard.hole[i - 1].radius = parseFloat(inputradius.value);
        });
    }
}
const drawHoleEachTick = () => {
    requestAnimationFrame(drawHoleEachTick);
    if (billard.hole.length > 0) {
        let canvas = document.getElementById("canvasOutput");
        let ctx = canvas.getContext("2d");
        for (let i = 0; i < billard.hole.length; i++) {
            let hole = billard.hole[i];
            // Draw circle
            ctx.beginPath();
            ctx.arc(hole.x, hole.y, hole.radius, 0, 2 * Math.PI);
            ctx.strokeStyle = "orange";
            ctx.stroke();
            ctx.closePath();

        }
    }
}

eventInput();
requestAnimationFrame(drawHoleEachTick);
initButtonHole();

export function getTrous(){
    //console.log("taille de la liste : "+billard.hole.length);
    let listTrous = new Array();
    for (let index = 0; index < billard.hole.length; index++) {
        let element = billard.hole[index];
        if (element.x!=0 && element.y!=0){
            listTrous.push([element.x, element.y]);
        }
    }
    return listTrous;
}
export {billard};