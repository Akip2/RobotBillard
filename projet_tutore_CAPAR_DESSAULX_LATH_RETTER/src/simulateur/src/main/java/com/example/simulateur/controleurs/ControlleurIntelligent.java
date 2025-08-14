package com.example.simulateur.controleurs;

import com.example.simulateur.modeles.Boule;
import com.example.simulateur.modeles.ModeleBillardAmericain;

import static com.example.simulateur.modeles.ModeleBillardAmericain.*;

public class ControlleurIntelligent extends ControllerInterface {
    public ControlleurIntelligent(ModeleBillardAmericain modele) {
        this.modele = modele;
        this.robot = modele.getRobots()[0];
        ControllerUpdater controllerUpdater = new ControllerUpdater(this, modele.getUpdater());
        controllerUpdater.start();
    }

    @Override
    public void update() {
        // récupère la boule la plus proche du robot et essaie de l'envoyer dans le trou le plus aligné avec elle
        Boule bouleLaPlusProche = modele.getBoulePlusProcheDeRobot();
        if (bouleLaPlusProche != null) {
            int trouLePlusAligne = modele.getIndiceTrouLePlusAligneAvecBoule(bouleLaPlusProche);
            if (trouLePlusAligne != -1) {
                double angleBouleTrou = modele.getAngleObjetVersTrou(bouleLaPlusProche, trouLePlusAligne);
                double angleRobotBoule = robot.angleVersObjet(bouleLaPlusProche);
                // si l'angle robot-boule est proche de l'angle boule-trou (à une tolerance près), on fait avancer le robot
                if(Math.abs(angleBouleTrou - angleRobotBoule) < TOLERANCE_ANGLE) {
                    robot.accelererMoteurDroit(ACCELERATION_QUAND_ALIGNE);
                    robot.accelererMoteurGauche(ACCELERATION_QUAND_ALIGNE);
                } else {
                    // sinon, on détermine un point cible qui permettra d'aligner le robot, la boule et le trou
                    double xCible = bouleLaPlusProche.getX() + Math.cos(angleBouleTrou) * 100;
                    double yCible = bouleLaPlusProche.getY() + Math.sin(angleBouleTrou) * 100;
                    // si le point est innateignable, la cible est la boule
                    if(!pointAccessibleParRobot(xCible, yCible)) {
                        xCible = bouleLaPlusProche.getX();
                        yCible = bouleLaPlusProche.getY();
                    }
                    double angleRobotCible = robot.angleVersPoint(xCible, yCible);
                    // on oriente le robot vers l'angle cible
                    if(Math.abs(angleRobotCible - robot.getDirection()) < TOLERANCE_ANGLE) {
                        robot.accelererMoteurDroit(ACCELERATION_QUAND_ALIGNE);
                        robot.accelererMoteurGauche(ACCELERATION_QUAND_ALIGNE);
                    } else {
                        if (angleRobotCible - robot.getDirection() > 0 && angleRobotCible - robot.getDirection() < Math.PI || angleRobotCible - robot.getDirection() < -Math.PI){
                            modifierAngleRobot(VITESSE_ROTATION);
                        } else {
                            modifierAngleRobot(-VITESSE_ROTATION);
                        }
                    }
                }
            }
        }
    }
}
