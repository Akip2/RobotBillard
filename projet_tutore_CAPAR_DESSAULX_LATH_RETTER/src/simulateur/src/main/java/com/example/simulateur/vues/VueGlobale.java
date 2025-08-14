package com.example.simulateur.vues;

import com.example.simulateur.modeles.Boule;
import com.example.simulateur.modeles.ModeleBillardAmericain;
import com.example.simulateur.modeles.Sujet;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;

public class VueGlobale extends Pane implements Observateur{
    private ModeleBillardAmericain modele;
    private VueBillardAmericain vueBillardAmericain;

    public VueGlobale(ModeleBillardAmericain modele) {
        this.modele = modele;
        vueBillardAmericain = new VueBillardAmericain(modele);
        getChildren().add(vueBillardAmericain);
        Color[] couleurs = {Color.WHITE,Color.YELLOW, Color.BLUE, Color.RED, Color.PURPLE, Color.ORANGE, Color.GREEN, Color.BROWN, Color.BLACK};

        Boule[] boules = modele.getBoules();
        for (int i = 0; i <= 8; i++) {
            if (i == 0) {
                VueBouleBlanche vueBouleBlanche = new VueBouleBlanche(boules[i]);
                vueBillardAmericain.ajouterVue(vueBouleBlanche);
            } else {
                VueBoulePleine vueBoulePleine = new VueBoulePleine(couleurs[i], i, boules[i]);
                vueBillardAmericain.ajouterVue(vueBoulePleine);
            }
        }
        for (int i = 9; i <= 15; i++) {
            VueBouleRayee vueBouleRayee = new VueBouleRayee(couleurs[i-8], i, boules[i]);
            vueBillardAmericain.ajouterVue(vueBouleRayee);
        }

        VueRobot vueRobot = new VueRobot(Color.RED, modele.getRobots()[0]);
        vueBillardAmericain.ajouterVue(vueRobot);

        getChildren().add(vueRobot);
    }

    @Override
    public void update(Sujet s) {
        vueBillardAmericain.update(modele);
    }
}
