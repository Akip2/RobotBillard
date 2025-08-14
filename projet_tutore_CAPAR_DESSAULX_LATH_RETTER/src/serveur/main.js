import { calculerMouv } from "./algo_boule_trou.js";

var robotX = -1, robotY = -1, robotDirection = -1;
var bouleX = -1, bouleY = -1;
var trous = [[692,58]];

export function start(){
    console.log('starting algo !');
    calculerMouv(robotX,robotY,robotDirection,bouleX,bouleY,trous);
}

export function setPositionsRobot(rX, rY, rD){
    robotX = rX;
    robotY = rY;
    robotDirection = rD;
}

export function setPositionsBoules(bX,bY){
    bouleX = bX;
    bouleY = bY;
}


export function setTrous(t){
    //[[652,69], [160,248]]
    //let trous = [[0,50], [150,50], [300,50], [0,200], [150,200], [300,200]];
    //let hole = [[652,69], [160,248]];
    //trous= hole; 
    //trous = t;
}


export function getRobot(){
    return {x: robotX, y: robotY, d: robotDirection};
}

export function getBoule(){
    return {x: bouleX, y: bouleY};
}