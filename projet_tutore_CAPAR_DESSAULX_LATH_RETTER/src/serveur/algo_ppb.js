import io from "socket.io-client";

let socket = io();

let TOLERANCE_ANGLE = 0.1;
let DECALAGE_BOULE_CIBLE = 100;
let VITESSE_ROTATION = 10;
let VITESSE_AVANCEMENT = 10;

function update(xRobot, yRobot, boules, trous, directionRobot,  rayonRobot, largeurBillard, longueurBillard) {
    let boulePlusProche = getBoulePlusProcheDuRobot(boules, xRobot, yRobot);
    let indiceTrouLePlusAligne = getIndiceTrouLePlusAligneAvecBoule(boulePlusProche, trous);
    let angleRobotBoule = getAngleVers(xRobot, yRobot, boulePlusProche[0], boulePlusProche[1]);
    let angleBouleTrou = getAngleVers(boulePlusProche[0], boulePlusProche[1] , trous[indiceTrouLePlusAligne].x, trous[indiceTrouLePlusAligne].y);
    // si l'angle robot-boule est proche de l'angle boule-trou (à une tolerance près), on fait avancer le robot
    if(Math.abs(angleRobotBoule - angleBouleTrou) < TOLERANCE_ANGLE){
        faireAvancerRobot(VITESSE_AVANCEMENT);
    } else {
        // sinon, on détermine un point cible qui permettra d'aligner le robot, la boule et le trou
        let xCible = boulePlusProche[0] + DECALAGE_BOULE_CIBLE * Math.cos(angleBouleTrou);
        let yCible = boulePlusProche[1] + DECALAGE_BOULE_CIBLE * Math.sin(angleBouleTrou);
        // si le point est innateignable, la cible est la boule
        if(!pointAccessibleParRobot(xRobot, yRobot, xCible, yCible, rayonRobot, largeurBillard, longueurBillard)){
            xCible = boulePlusProche[0];
            yCible = boulePlusProche[1];
        }
        // on détermine l'angle robot-cible
        let angleRobotCible = getAngleVers(xRobot, yRobot, xCible, yCible);
        // si l'angle robot-cible est proche de l'angle robot-boule, on fait avancer le robot
        if(Math.abs(angleRobotCible - angleRobotBoule) < TOLERANCE_ANGLE){
            faireAvancerRobot(VITESSE_AVANCEMENT);
        } else {
            // sinon, on modifie l'angle du robot pour qu'il soit plus proche de l'angle robot-cible
            // si l'angle est trop grand, on fait tourner le robot dans l'autre sens
            if (angleRobotCible - directionRobot > 0 && angleRobotCible - directionRobot < 180 || angleRobotCible - directionRobot < -180){
                modifierAngleRobot(VITESSE_ROTATION);
            } else {
                modifierAngleRobot(-VITESSE_ROTATION);
            }
        }
    }

}

function getBoulePlusProcheDuRobot(boules, xRobot, yRobot) {
    let boulePlusProche = boules[0];
    let distanceMin = getDistanceEntreDeuxPoints(boules[0].x, boules[0].y, xRobot, yRobot);
    for (let i = 1; i < boules.length; i++) {
        let distance = getDistanceEntreDeuxPoints(boules[i].x, boules[i].y, xRobot, yRobot);
        if (distance < distanceMin) {
            boulePlusProche = boules[i];
            distanceMin = distance;
        }
    }
    return boulePlusProche;
}

function getIndiceTrouLePlusAligneAvecBoule(boule, trous) {
    let indiceTrouLePlusAligne = -1;
    let angleMin = double.MAX_VALUE;
    for (let i = 1; i < trous.length; i++) {
        let angle = getAngleVers(boule.x, boule.y, trous[i].x, trous[i].y);
        if (angle < angleMin) {
            indiceTrouLePlusAligne = i;
            angleMin = angle;
        }
    }
    return indiceTrouLePlusAligne;
}

function getAngleVers(xDepart, yDepart, xArrivee, yArrivee) {
    return Math.atan2(yArrivee - yDepart, xArrivee - xDepart);
}

function getDistanceEntreDeuxPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function pointAccessibleParRobot(xRobot, yRobot, xPoint, yPoint, rayonRobot, largeurBillard, longueurBillard) {
    if(xPoint < rayonRobot || xPoint > largeurBillard - rayonRobot || yPoint < rayonRobot || yPoint > longueurBillard - rayonRobot){
        return false;
    }
    return true;
}

function faireAvancerRobot(avancement){
    //TODO
}

function modifierAngleRobot(angle){
    //TODO
}




