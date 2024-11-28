import Robot from "./objects/robot.js";
import Ball from "./objects/ball.js";
import Table from "./table.js";
import {width, height, ballSize, ballColors, holeSize, robotWidth, robotHeight} from "./params.js";
import VueSimulateur from "./vue-simulateur.js";
import CollisionController from "./collision-controller.js";

const canvasContainer=document.getElementById("canvas-container");

let balls=[];
ballColors.forEach(color=>{
    let ball=new Ball(ballSize, color, (Math.random()*(width-holeSize*2))+holeSize, Math.random()*(height-holeSize*2)+holeSize);
    balls.push(ball);
});

let robot=new Robot(robotWidth,robotHeight, 6.5, width/2+15, height/2+17);

let vue=new VueSimulateur(canvasContainer);
vue.setup();
vue.run();

let table=new Table([robot], balls, vue);
let colController=new CollisionController(table);
colController.createEvent(vue.engine);
table.notifyView();