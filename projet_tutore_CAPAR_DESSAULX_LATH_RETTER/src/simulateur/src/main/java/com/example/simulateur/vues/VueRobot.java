package com.example.simulateur.vues;

import com.example.simulateur.modeles.ModeleBillardAmericain;
import com.example.simulateur.modeles.Robot;
import com.example.simulateur.modeles.Sujet;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Line;

public class VueRobot extends Pane implements Observateur{
    private double angle;

    private Circle robot;
    private Color couleurRobot;
    private Line direction;

    private Robot robotModele;

    public VueRobot(Color couleurRobot, Robot robotModele) {
        double x = robotModele.getX();
        double y = robotModele.getY();
        this.setLayoutX(x);
        this.setLayoutY(y);
        double rayon = robotModele.getRayon();
        this.angle = 0;
        this.robot = new Circle(0, 0, rayon);
        this.couleurRobot = couleurRobot;
        this.direction = new Line(0, 0, 0 , 0);
        this.robotModele = robotModele;

        robot.setFill(couleurRobot);
        getChildren().add(robot);
        getChildren().add(direction);
    }

    @Override
    public void update(Sujet s) {
        ModeleBillardAmericain modele = (ModeleBillardAmericain) s;
        Robot robotModele = modele.getRobots()[0];
        double x = robotModele.getX();
        double y = robotModele.getY();
        //update direction
        this.angle = robotModele.getDirection();
        this.direction.setEndX(robotModele.getRayon() * Math.cos(angle));
        this.direction.setEndY(robotModele.getRayon() * Math.sin(angle));
        //update position
        this.setLayoutX(x);
        this.setLayoutY(y);
    }
}
