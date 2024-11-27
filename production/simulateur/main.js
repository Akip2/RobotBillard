import Robot from "./objects/robot.js";
import Ball from "./objects/ball.js";
import Table from "./table.js";
import {width, height, ballSize, ballColors, holeSize} from "./params.js";

const canvasContainer=document.getElementById("canvas-container");

let balls=[];
ballColors.forEach(color=>{
    let ball=new Ball(ballSize, color, (Math.random()*(width-holeSize*2))+holeSize, Math.random()*(height-holeSize*2)+holeSize);
    balls.push(ball);
});

let robot=new Robot(30, 35, 6.5, width/2+15, height/2+17);

let table=new Table([robot], balls);
table.setup();