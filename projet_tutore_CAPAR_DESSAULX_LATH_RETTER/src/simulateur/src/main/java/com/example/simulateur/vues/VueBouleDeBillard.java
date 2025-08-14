package com.example.simulateur.vues;

import com.example.simulateur.modeles.Boule;
import com.example.simulateur.modeles.Sujet;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;

public abstract class VueBouleDeBillard extends Pane implements Observateur{
    protected double rayon;
    protected Circle boule;
    protected Color couleurBoule;
    protected Boule bouleModele;

    public VueBouleDeBillard(Color couleurBoule, Boule bouleModele) {
        this.rayon = bouleModele.getRayon();
        this.boule = new Circle(0, 0, rayon);
        this.couleurBoule = couleurBoule;
        this.bouleModele = bouleModele;

        boule.setFill(couleurBoule);
        getChildren().add(boule);

        this.setLayoutX(bouleModele.getX());
        this.setLayoutY(bouleModele.getY());
    }

    public double getX() {
        return bouleModele.getX();
    }

    public void setX(double x) {
        boule.setCenterX(x);
    }

    public double getY() {
        return bouleModele.getY();
    }

    public void setY(double y) {
        boule.setCenterY(y);
    }

    @Override
    public void update(Sujet s) {
        setLayoutX(bouleModele.getX());
        setLayoutY(bouleModele.getY());
    }
}
