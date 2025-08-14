package com.example.simulateur.vues;

import com.example.simulateur.modeles.Boule;
import com.example.simulateur.modeles.Sujet;
import javafx.scene.paint.Color;
import javafx.scene.shape.Rectangle;

import java.util.Optional;

public class VueBouleRayee extends VueBouleNumerotee{
    public VueBouleRayee(Color couleurBoule, int numero, Boule bouleModele) {
        super(Color.BEIGE , numero, Optional.of(couleurBoule), bouleModele);
    }
}
