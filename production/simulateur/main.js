import Robot from "./objects/robot.js";
import Ball from "./objects/ball.js";
import Table from "./table.js";
import {width, height} from "./global.js";
import Hole from "./objects/hole.js";

const ballSize=10;
const ballColors=["blue", "yellow", "red", "purple", "orange", "pink", "black"];

const holeSize=ballSize*1.5;
const holePositions=[[holeSize/2, height-holeSize/2], [holeSize/2, holeSize/2], [width/2, holeSize/2], [width-holeSize/2, holeSize/2], [width-holeSize/2, height-holeSize/2], [width/2, height-holeSize/2]];

let holes=[];
holePositions.forEach(([x,y]) => {
    let hole=new Hole(holeSize, x, y);
    holes.push(hole);
})

let balls=[];
ballColors.forEach(color=>{
    let ball=new Ball(ballSize, color, (Math.random()*(width-holeSize*2))+holeSize, Math.random()*(height-holeSize*2)+holeSize);
    balls.push(ball);
});

let robot=new Robot(30, 35, 6.5, width/2+15, height/2+17);
let table=new Table([robot], balls, holes);
table.setup();