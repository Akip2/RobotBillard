package com.example.simulateur.vues;

import com.example.simulateur.modeles.Boule;
import com.example.simulateur.modeles.Sujet;
import javafx.scene.paint.Color;

public class VueBouleBlanche extends VueBouleDeBillard{
    public VueBouleBlanche(Boule bouleModele) {
        super(Color.WHITE, bouleModele);
    }
}
