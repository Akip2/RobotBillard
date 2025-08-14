import io from "socket.io-client";
import {determinerTrou} from "./algo_meilleur_trou.js";
import {calculerTrajectoire} from "./calculTraj.js";
import { getRobot, getBoule } from "./main.js";

let width = -1; let height = -1;


let socket = io.connect("http://localhost:8001");
socket.emit('message','algo_boule_troue.js');
//socket.emit('mouvement', 0+" "+0+" "+0+" "+0);


/*
                                                                            TROUVERA QUI POURRA
                                                                                                        _.oo.
                                                                                 _.u[[/;:,.         .odMMMMMM'
                                                                              .o888UU[[[/;:-.  .o@P^    MMM^
                                                                             oN88888UU[[[/;::-.        dP^
                                                                            dNMMNN888UU[[[/;:--.   .o@P^
                                                                           ,MMMMMMN888UU[[/;::-. o@^
                                                                           NNMMMNN888UU[[[/~.o@P^
                                                                           888888888UU[[[/o@^-..
                                                                          oI8888UU[[[/o@P^:--..
                                                                       .@^  YUU[[[/o@^;::---..
                                                                     oMP     ^/o@P^;:::---..
                                                                  .dMMM    .o@^ ^;::---...
                                                                 dMMMMMMM@^`       `'''''
                                                                YMMMUP^
                                                                M°'
*/



export function setVideoSize(videoW, videoH){
    width = videoW;
    height = videoH;
}



export function calculerMouv(robotX, robotY, robotDirection, bouleX, bouleY, trous){
    console.log();
    console.log("robotX : " + robotX + " robotY : " + robotY + " robotD : "  + robotDirection + " bouleX :" + bouleX +" bouleY : "+ bouleY);
    if (robotX!=-1 || robotY!=-1 || robotDirection!=-1 || bouleX!=-1 || bouleY!=-1 || !trous.isEmpty()){

        

        let init_robotX = robotX;
        let init_robotY = robotY;

        let meilleurTrou = determinerTrou(robotX, robotY, robotDirection, bouleX, bouleY, trous);

        let angle_hypotenuse = 180-90-meilleurTrou[2];

        //console.log("angle : " +angle_hypotenuse);

        let distanceTR = Math.sqrt(Math.pow(meilleurTrou[0]-robotX,2)+Math.pow(meilleurTrou[1]-robotY,2))
            //Math.abs(meilleurTrou[0]-robotX) + Math.abs(meilleurTrou[1]-robotY);

        console.log("La première longueur calculé " + distanceTR);

        let distanceRVecInter = distanceTR * Math.cos(angle_hypotenuse* (Math.PI / 180));

        //console.log(Math.cos(angle_hypotenuse* (Math.PI / 180)));

        console.log("La longueur calculé " + distanceRVecInter);

        let distanceTRecInter = Math.sqrt(Math.pow(distanceTR,2)-Math.pow(distanceRVecInter,2));

        //console.log("Pourquooooi : "+distanceTRecInter );

        let vector_boule = {x: bouleX - meilleurTrou[0], y: bouleY - meilleurTrou[1]};

        console.log("vecteur : (" + vector_boule.x + "," + vector_boule.y+")");
        console.log("distance  "+distanceTRecInter);
        console.log("point : "+meilleurTrou[0], meilleurTrou[1]);

        //console.log("vecteur : " + )
        let norm_vecteur_boule = Math.sqrt(Math.pow(vector_boule.x,2)+ Math.pow(vector_boule.y,2));

        let vecteur_boule_unitaire = {x: vector_boule.x/norm_vecteur_boule, y: vector_boule.y/norm_vecteur_boule};

        let mult_distance_norm_vecteur_boule = {x: vecteur_boule_unitaire.x*distanceTRecInter, y: vecteur_boule_unitaire.y*distanceTRecInter};

        //console.log("multiplicateur : "+mult_distance_norm_vecteur_boule)

        let pointIntermediaire = {x: meilleurTrou[0]+mult_distance_norm_vecteur_boule.x, y: meilleurTrou[1]+mult_distance_norm_vecteur_boule.y};

        console.log("point : ("+pointIntermediaire.x+","+pointIntermediaire.y+")");

        socket.emit('triangle',[pointIntermediaire,{x: robotX, y: robotY},{x: meilleurTrou[0], y: meilleurTrou[1]}]);

        /*
         On va donné la liste du chemin à faire, dans notre cas ça sera toujours 2 pos : le point intermédiaire et la boule
         Quand il fais l'algorithme pour un point, il le supprime de la liste
         Si il reste qu'un seul point alors il faut spécifier au robot de frapper et pas de positionnner
         Il termine quand il n'y a plus de points dans la liste et recommence si la boule n'est pas dans le trou.

         dans l'algo : on tourne puis avance (on se place) mais on tourne puis on frappe aussi
            => condition : s'il reste qu'une seule pos à atteindre sinon ...
        */
        //Chemin : [ point1, point2 ]
        let chemin = [ pointIntermediaire, {x: bouleX, y:bouleY} ];


        //à vrai si le robot est dirigé vers le point intermédiaire
        let rotate_point_ok = false; 

        //à vrai si le robot est sur le vecteur boule/trou
        let position_point_ok = false;

        //à vrai si le robot est dirigé vers la boule
        let rotate_boule_ok = false;

        function rotate_to_point(){
            console.log("PHASE DE ROTATION 1");
            if (!rotate_point_ok){
                rotate_point_ok = rotateRobot(robotX, robotY, robotDirection, chemin[0]);
                //enfaite ce serait bien de capter ici
                let robot = getRobot();
                let boule = getBoule();
                robotX = robot.x;
                robotY = robot.y;
                robotDirection = robot.d;
                bouleX = boule.x;
                bouleY = boule.y;
                console.log("Coordonnées après rotation : "+robotX+" "+robotY+" "+robotDirection);
                if (rotate_point_ok){
                    clearInterval(numInt1);
                }
            }
        }
        
        function position_to_point(){
            
            if (rotate_point_ok && !position_point_ok && !rotate_boule_ok){
                console.log("PHASE DE POSITIONNEMENT");
                position_point_ok = positionnerRobot(robotX, robotY, robotDirection,init_robotX, init_robotY, distanceRVecInter);
                //et de capter aussi ici 
                let robot = getRobot();
                let boule = getBoule();
                robotX = robot.x;
                robotY = robot.y;
                robotDirection = robot.d;
                bouleX = boule.x;
                bouleY = boule.y;
                if (position_point_ok){
                    clearInterval(numInt2) 
                }
            }
        }

        function rotate_to_ball(){  
            if (!rotate_boule_ok && position_point_ok  && rotate_point_ok){
                console.log("PHASE DE ROTATION 2");
                rotate_boule_ok = rotateRobot(robotX, robotY, robotDirection, chemin[1]);
                //et de capter aussi ici 
                let robot = getRobot();
                let boule = getBoule();
                robotX = robot.x;
                robotY = robot.y;
                robotDirection = robot.d;
                bouleX = boule.x;
                bouleY = boule.y;
                if (rotate_boule_ok){
                    console.log("PHASE DE FRAPPE");
                    frapper();
                    clearInterval(numInt3) 
                }
            }
        }

        let numInt1 = setInterval(rotate_to_point,1000);
        let numInt2 = setInterval(position_to_point,1000);
        let numInt3 = setInterval(rotate_to_ball,1000);
    }
}

/*
*           FONCTION POUR ROTATE LE ROBOT
*/

function rotateRobot(robotX, robotY, robotDirection, point){
    //console.log("je rentre enfaite , robotX :" + robotX + " robotY : "+ robotY + " robot Direction  : " +robotDirection + " pointX : " + point.x + "pointY : "+ point.y +" MDR c'est lui");
    
    if (robotX!=-1 && robotY!=-1 && robotDirection!=-1 && point!=null ){
        //console.log("direction : " + robotDirection);

        let temps = 1000;

        //calcul vecteur point - robot
        var vector = {x: point.x - robotX, y: point.y - robotY}

        // theta
        var theta = Math.atan2(vector.y, vector.x) * 180 / Math.PI;
        if (theta < 0) {
            theta += 360;
        }

        let angle= ( robotDirection - theta + 180 ) % 360 - 180;
        angle = angle < -180 ? angle + 360 : angle;
        angle = angle * -1;

        console.log("angle : " +angle+"\n");
            
        if (angle <= 3 && angle >= -3){
            return true;
        }else{
            //console.log("AHHH");
            let coef = 0.5; 
            let pw = Math.round(angle * coef);
            console.log("le pw = " +pw);
            pw = (pw >= -70 && pw <=70) ? Math.sign(pw)*80 : pw;
            //socket.emit('mouvement', 0+" "+0+" "+0+" "+0);
            rotate(pw, 300);
            return false;
        }
        
    }
}

/*
*           FONCTION POUR AVANCER LE ROBOT
*/

function positionnerRobot(robotX, robotY, robotDirection, init_robotX, init_robotY, distance){
    if (robotX!=-1 && robotY!=-1 && robotDirection!=-1){
      //  console.log("direction : " + robotDirection);

      //console.log("\n\nROBOTX : " +robotX + " ROBOTY : "+robotY+ " ROBOTDIR : "+ robotDirection+ " INITROBOTX : "+init_robotX + " INITROBOTY : "+init_robotY+" DISTANCE : "+distance+"\n\n")

        let temps = 200;

        let distance_actuel = Math.sqrt(Math.pow(robotX-init_robotX,2)+Math.pow(robotY-init_robotY,2));

        console.log("distance_actu : "+distance_actuel)

        let eccart = distance_actuel-distance;

        console.log("eccart = " +eccart);

        if(eccart <= 1 && eccart >= -1){
            return true;
        }
        else {
        if (eccart<0){
            let pw = Math.abs(eccart);
            if (pw<70) pw =80;
            if(pw>255) pw=150
            rouler(Math.round(pw),temps);
            return false;
        }
        else{

            let pw = eccart;
            if (pw>-70) pw=-80
            if(pw<-255) pw=-150
            rouler(Math.round(pw), temps);
            return false;
        }}
      
    }
}

/*
*          FONCTION POUR TIRER DANS LA BOULE
*/

function frapper(){
    let dateDuJour = new Date(); 
    dateDuJour.setHours(0, 0, 0, 0); 
    let dateActuelle = new Date(); 
    let date = dateActuelle - dateDuJour.getTime();
    socket.emit('mouvement',255+" "+255+" "+3000+" "+date+" speed");
}

function rouler(puissance, temps) {
    let time = temps;
    let dateDuJour = new Date(); 
    dateDuJour.setHours(0, 0, 0, 0); 
    let dateActuelle = new Date(); 
    let date = dateActuelle - dateDuJour.getTime();
    socket.emit('mouvement', puissance*1.07+" "+puissance+" "+time+" "+date+" slow");
}

function rotate(puissance, temps) {
    let time = temps;
    let dateDuJour = new Date(); 
    dateDuJour.setHours(0, 0, 0, 0); 
    let dateActuelle = new Date(); 
    let date = dateActuelle - dateDuJour.getTime();
    //console.log("mouvement");
    socket.emit('mouvement', puissance+" "+(-puissance)+" "+time+" "+date+" slow");
}

