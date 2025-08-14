package com.example.simulateur.vues;

import com.example.simulateur.modeles.Boule;
import com.example.simulateur.modeles.Sujet;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Rectangle;
import javafx.scene.text.Text;

import java.util.Optional;

public abstract class VueBouleNumerotee extends VueBouleDeBillard{
    protected int numero;
    protected Text numeroTexte;
    protected Circle fondNumero;

    public VueBouleNumerotee(Color couleurBoule, int numero, Optional<Color> couleurRayure, Boule bouleModele) {
        super(couleurBoule, bouleModele);
        this.numero = numero;
        this.numeroTexte = new Text(String.valueOf(numero));
        this.numeroTexte.setStyle("-fx-font-size: " + bouleModele.getRayon() * 0.75);
        this.numeroTexte.setFill(Color.BLACK);
        if(numero < 10){
            this.numeroTexte.setX(-rayon/4);
        }else {
            this.numeroTexte.setX(-rayon/2);
        }
        this.numeroTexte.setY(rayon/4);
        this.fondNumero = new Circle(0, 0, rayon/2);
        this.fondNumero.setFill(Color.WHITE);
        if(couleurRayure.isPresent()){
            Rectangle rayure = new Rectangle( bouleModele.getRayon() * 1.75, bouleModele.getRayon(), couleurRayure.get());
            rayure.setX(-bouleModele.getRayon() * 0.875);
            rayure.setY(-bouleModele.getRayon() * 0.5);
            getChildren().addAll(rayure, fondNumero, numeroTexte);
        }else {
            getChildren().addAll(fondNumero, numeroTexte);
        }
        this.setLayoutX(bouleModele.getX());
        this.setLayoutY(bouleModele.getY());
    }

    public int getNumero() {
        return numero;
    }
}
