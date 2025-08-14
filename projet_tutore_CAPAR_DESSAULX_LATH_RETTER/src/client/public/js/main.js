import { } from "../libs/polyfill.js";
import { } from "../libs/cv.js";
import { } from "../libs/aruco.js";
import {} from "./billard.js";
import { getXYD, onLoad } from "./aruco_detect.js";
import { getXYBouleTarget, isReady } from "./detectingCircles.js";
import { getBallSelected } from "./display_paths.js";
import {drawTriangle} from "./drawTools.js";
import {} from "./knnCircles.js";
let socket = io();

let video = "";
let opencvOn = false;

cv['onRuntimeInitialized']=()=>{
    console.log("OpenCV is Initialized");
    opencvOn = true;
    startJS();
}

window.onload = () => {
    console.log("page is fully loaded");
    video = document.getElementById('video');
    socket.emit('videoHeightWidth',video.height+" "+video.width);
    startJS();
};

function startJS(){
    if(video!="" && opencvOn){
        console.log("Starting JS scripts !");
        isReady(video);
        onLoad();
    }
}

function reloadOpenCV(){
    if(!opencvOn){
        location.reload();
    }else{
        clearInterval(intervalID);
    }
}
let intervalID = setInterval(reloadOpenCV,1000);


function envoyerCoord(){
    let robot = getXYD();
    //let boule = getBallSelected();
    socket.emit('positionRobot',robot);
    
}

setInterval(envoyerCoord,1000);

