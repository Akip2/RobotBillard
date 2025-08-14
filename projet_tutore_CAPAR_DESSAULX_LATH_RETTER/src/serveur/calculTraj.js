import io from "socket.io-client";

let width = -1; let height = -1;

let socket = io.connect("http://localhost:8001");
socket.emit('message','CalculTraj.js');

export function setVideoSize(videoW, videoH){
    width = videoW;
    height = videoH;
}

export function calculerTrajectoire(robotX, robotY, robotDirection, bouleX, bouleY){
    console.log();
    console.log("robotX : " + robotX + " robotY : " + robotY + " robotD : "  + robotDirection + " bouleX :" + bouleX +" bouleY : "+ bouleY);
    if (robotX!=-1 || robotY!=-1 || robotDirection!=-1 || bouleX!=-1 || bouleY!=-1){

        console.log("direction : " + robotDirection);

        let temps = 1000;

        //On calcule le vecteur entre le robot et la boule
        var vector = {x: bouleX - robotX, y: bouleY - robotY}

        // theta
        var theta = Math.atan2(vector.y, vector.x) * 180 / Math.PI;
        if (theta < 0) {
            theta += 360;
        }


        let angle= ( robotDirection - theta + 180 ) % 360 - 180;
        angle = angle < -180 ? angle + 360 : angle;   
        angle = angle * -1;

        //console.log("ANGLE AHHHHH: "+ angle);

        /*
        let angle = 0;
        console.log(robotDirection);
        angle = 180 - Math.abs(Math.abs(robotDirection - theta) - 180);
        console.log("AVANT MODIF : " + angle)
        if (robotDirection>theta) angle = (-1) * angle;
        console.log("APRES MODIF : " + angle)
        */
        /*
        if (robotDirection<theta){
            angle = robotDirection-theta;
        }else{
            angle = theta-robotDirection;
        }
        */
        //console.log(angle);

        //On regarde la direction du robot
        //Si le robot pointe dans la direction de la boule
            //On avance tout droit jusqu'à la boule (pour la frapper)
        //Sinon 
            //On tourne le robot jusqu'à faire correspondre sa direction au vecteur
            //On avance jusqu'à la boule


        console.log("Theta = "+theta);
        console.log("Angle = "+angle);
        if (angle <= 10 && angle >= -10){
            //calcul de la puissance en fonction de la distance à laquelle le robot se trouve de la boule à taper
            let coef = 1;
            let diffX = Math.abs(robotX - bouleX);
            let diffY = Math.abs(robotY - bouleY);

            //coef = 1 : vitesse max, avoir un coeff proche de 1 quand le robot est loin de la boule
            coef = Math.round(((diffX / width) + (diffY / height)) / 2 * 10)/10; 

            let pw = Math.round(100 * coef);
            pw = (pw <=30) ? 40 : pw;
            console.log("JE ROULLLLLLE §§§!");
            //pw = 200;
            rouler(pw, temps);
        }else{
            
            //calcul du coefficient de la puissance du moteur à donner par rapport à l'angle 
            let coef = 1;
            /*
            coef = Math.round(angle/180*10)/10;
            */
            
            coef = 1.5; //Explications : Théorie : le robot lorsqu'il va à fond il fait 190°, donc 255/190 ~= 1.35

            //calcul de la puissance et du temps en fonction de l'angle à faire
            //let pw = Math.round(100 * coef);
            let pw = Math.round(angle * coef);
            pw = (pw >= -70 && pw <=70) ? Math.sign(pw)*70 : pw;

            //console.log("PW : "+pw+" Temps : "+temps+" angle : "+angle+" coef : "+coef);
            rotate(pw, temps);
        }
    }
}

function rouler(puissance, temps) {
    let time = temps;
    let dateDuJour = new Date();
    dateDuJour.setHours(0, 0, 0, 0);
    let dateActuelle = new Date();
    let date = dateActuelle - dateDuJour.getTime();
    socket.emit('mouvement', puissance+" "+puissance+" "+time+" "+date+" slow");
}

function rotate(puissance, temps) {
    let time = temps;
    let dateDuJour = new Date();
    dateDuJour.setHours(0, 0, 0, 0);
    let dateActuelle = new Date();
    let date = dateActuelle - dateDuJour.getTime();
    //socket.emit('mouvement', mg+" "+md+" "+time+" "+date);
    socket.emit('mouvement', puissance+" "+(-puissance)+" "+time+" "+date+" slow");
}

