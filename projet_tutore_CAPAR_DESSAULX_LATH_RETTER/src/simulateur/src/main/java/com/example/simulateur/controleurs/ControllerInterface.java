package com.example.simulateur.controleurs;

import com.example.simulateur.modeles.ModeleBillardAmericain;
import com.example.simulateur.modeles.Robot;

import static com.example.simulateur.modeles.ModeleBillardAmericain.ACCELERATION;
import static com.example.simulateur.modeles.ModeleBillardAmericain.VITESSE_ROTATION;

public abstract class ControllerInterface {
    protected ModeleBillardAmericain modele;
    protected Robot robot;

    public abstract void update();

    public ModeleBillardAmericain getModele() {
        return modele;
    }

    public void faireAvancerRobot() {
        modifierVitesseRobot(ACCELERATION, ACCELERATION);
    }

    public void faireReculerRobot() {
        modifierVitesseRobot(-ACCELERATION, -ACCELERATION);
    }

    public void faireTournerRobotGauche() {
        modifierAngleRobot(-VITESSE_ROTATION);
    }

    public void faireTournerRobotDroite() {
        modifierAngleRobot(VITESSE_ROTATION);
    }

    public void modifierAngleRobot(int angle) {
        robot.setDirection(robot.getDirection() + Math.toRadians(angle));
    }

    public void freinerRobot(double freinage) {
        robot.freinerMoteurDroit(freinage);
        robot.freinerMoteurGauche(freinage);
    }

    public void modifierVitesseRobot(double aDroit, double aGauche) {
        robot.accelererMoteurDroit(aDroit);
        robot.accelererMoteurGauche(aGauche);
    }
}
