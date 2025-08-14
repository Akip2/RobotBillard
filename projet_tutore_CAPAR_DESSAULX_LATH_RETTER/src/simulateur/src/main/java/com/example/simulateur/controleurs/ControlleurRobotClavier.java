package com.example.simulateur.controleurs;

import com.example.simulateur.modeles.ModeleBillardAmericain;
import com.example.simulateur.modeles.Robot;
import javafx.scene.input.KeyEvent;

import java.util.HashSet;
import java.util.Set;

import static com.example.simulateur.modeles.ModeleBillardAmericain.*;

public class ControlleurRobotClavier extends ControllerInterface{
    private Set<String> keysCurrentlyDown;

    public ControlleurRobotClavier(ModeleBillardAmericain modele) {
        this.modele = modele;
        this.robot = modele.getRobots()[0];
        this.keysCurrentlyDown = new HashSet<>();
        ControllerUpdater controllerUpdater = new ControllerUpdater(this, modele.getUpdater());
        controllerUpdater.start();
    }

    public void ajouterTouche(KeyEvent key) {
        keysCurrentlyDown.add(key.getCode().toString());
    }

    public void retirerTouche(KeyEvent key) {
        keysCurrentlyDown.remove(key.getCode().toString());
    }

    public void handleKeyPressed(KeyEvent key) {
        ajouterTouche(key);
    }

    public void handleKeyReleased(KeyEvent key) {
        retirerTouche(key);
    }

    @Override
    public void update() {
        if (keysCurrentlyDown.contains("UP")) {
            faireAvancerRobot();
        }
        if (keysCurrentlyDown.contains("DOWN")) {
            faireReculerRobot();
        }
        if (keysCurrentlyDown.contains("LEFT")) {
            faireTournerRobotGauche();
        }
        if (keysCurrentlyDown.contains("RIGHT")) {
            faireTournerRobotDroite();
        }
        if (keysCurrentlyDown.isEmpty()) {
            freinerRobot(FREINAGE);
        }
        Robot robot = modele.getRobots()[0];
        robot.actualiserVxVy();
        modele.notifierObservateurs();
    }
}
