import io from "socket.io-client";

let avancer = true;
let robotX = -1, robotY = -1, robotDirection = -1;
let angle_avant = -1;
let calibrage_ok = false;
let socket = io.connect("http://localhost:8001");
let premier_calibrage = true;

export function recupererPositionDirectionRobot_calibrage(rX, rY, rD) {
    robotX = rX;
    robotY = rY;
    robotDirection = rD;

    if (robotDirection !== -1) {
        if (premier_calibrage) {
            angle_avant = robotDirection;
            let puissance = 255;
            rouler(puissance, puissance, 1000);
            premier_calibrage = false;
            calibrage_ok = true;
        } else if (!calibrage_ok) {
            let puissance = avancer ? 255 : -255;
            rouler(puissance, puissance, 1000);
            avancer = !avancer;
            calibrage_ok = true;
        } else {
            comparerAnglesEtCalibrer();
        }
    } else {
        console.log("Robot non detecté");
    }
}

function rouler(puissanceg, puissanced, temps) {
    let date = Date.now() - Date.parse("2024-01-01T00:00:00Z");
    socket.emit('mouvement', puissanceg + " " + puissanced + " " + temps + " " + date+" speed");
}

function calculerCalibrage() {
    if (robotX !== -1 && robotY !== -1 && robotDirection !== -1 && !calibrage_ok) {
        recupererPositionDirectionRobot_calibrage(robotX, robotY, robotDirection);
    }
}

function comparerAnglesEtCalibrer() {
    let differenceAngle = angle_avant - robotDirection;
    let ajustement = 50; 
    let vitesseMax = 255;
    let vitesseMoteurGauche = vitesseMax;
    let vitesseMoteurDroit = vitesseMax;
    if (Math.abs(differenceAngle) > 1) {
        console.log("Calibration requis. Angle avant: " + angle_avant + ", Angle après: " + robotDirection);
        if (differenceAngle > 0) {
            vitesseMoteurGauche -= Math.min(ajustement, differenceAngle / 180 * ajustement);
        } else {
            vitesseMoteurDroit += Math.min(ajustement, differenceAngle / 180 * ajustement);
        }
    
        vitesseMoteurGauche = Math.max(-vitesseMax, Math.min(vitesseMax, vitesseMoteurGauche));
        vitesseMoteurDroit = Math.max(-vitesseMax, Math.min(vitesseMax, vitesseMoteurDroit));
    
        if (avancer){
            console.log("------\n Vitesse moteur gauche : "+ vitesseMoteurGauche + "\n Vitesse moteur droit : "+ vitesseMoteurDroit);
            angle_avant = robotDirection;
            rouler(vitesseMoteurGauche, vitesseMoteurDroit, 1000);
            avancer = false;
        }
        else {
            console.log("------\n Vitesse moteur gauche : "+ vitesseMoteurGauche + "\n Vitesse moteur droit : "+ vitesseMoteurDroit);
            angle_avant = robotDirection;
            rouler(-vitesseMoteurGauche, -vitesseMoteurDroit, 1000);
            avancer = true;
        }
        
    } else {
        console.log("Tout est okey avec angle avant : " +angle_avant + " et angle après : " + robotDirection);
    }    
}

setInterval(calculerCalibrage, 1000);