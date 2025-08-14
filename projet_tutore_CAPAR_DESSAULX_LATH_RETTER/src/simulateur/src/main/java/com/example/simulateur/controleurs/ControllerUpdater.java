package com.example.simulateur.controleurs;

import com.example.simulateur.modeles.Updater;
import javafx.animation.AnimationTimer;

public class ControllerUpdater  extends AnimationTimer {
    private ControllerInterface controllerInterface;
    private long lastUpdate = 0;
    private Updater updater;

    public ControllerUpdater(ControllerInterface controllerInterface, Updater updater) {
        this.controllerInterface = controllerInterface;
        this.updater = updater;
    }

    @Override
    public void handle(long l) {
        if(controllerInterface instanceof ControlleurRobotClavier) {
            if (l - lastUpdate >= 5_000.00) {
                controllerInterface.update();
                updater.update();
                lastUpdate = l;
            }
        } else {
            if (l - lastUpdate >= 5_000.00) {
                controllerInterface.update();
                updater.update();
                lastUpdate = l;
            }
        }
    }
}
