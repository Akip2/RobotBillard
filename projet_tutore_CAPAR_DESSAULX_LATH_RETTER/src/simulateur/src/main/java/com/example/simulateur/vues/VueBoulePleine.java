package com.example.simulateur.vues;

import com.example.simulateur.modeles.Boule;
import com.example.simulateur.modeles.Sujet;
import javafx.scene.paint.Color;

import java.util.Optional;

public class VueBoulePleine extends VueBouleNumerotee{
    public VueBoulePleine(Color couleur, int numero, Boule bouleModele) {
        super(couleur, numero, Optional.empty(), bouleModele);
    }
}
