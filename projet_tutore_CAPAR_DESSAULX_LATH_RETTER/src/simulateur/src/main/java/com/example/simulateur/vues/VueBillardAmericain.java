package com.example.simulateur.vues;

import com.example.simulateur.modeles.ModeleBillardAmericain;
import com.example.simulateur.modeles.Sujet;
import javafx.scene.Node;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.shape.Circle;
import javafx.scene.shape.Rectangle;

import java.util.ArrayList;
import java.util.List;

import static com.example.simulateur.modeles.ModeleBillardAmericain.*;

public class VueBillardAmericain extends Pane implements Observateur{
    private ModeleBillardAmericain modeleBillardAmericain;
    private Rectangle fond;
    private Circle[] trous;

    private List<Observateur> vuesAUpdate;

    public VueBillardAmericain(ModeleBillardAmericain modeleBillardAmericain) {
        vuesAUpdate = new ArrayList<>();
        this.modeleBillardAmericain = modeleBillardAmericain;

        fond = new Rectangle((double) EPAISSEUR_BANDE /2, (double) EPAISSEUR_BANDE /2, LARGEUR - EPAISSEUR_BANDE, HAUTEUR - EPAISSEUR_BANDE);
        fond.setFill(Color.LIGHTGREEN);
        fond.setStroke(Color.BROWN);
        fond.setStrokeWidth(EPAISSEUR_BANDE);
        trous = new Circle[6];

        fond.getStyleClass().add("fond");
        for (int i = 0; i < 6; i++) {
            trous[i] = new Circle(modeleBillardAmericain.getTrou(i)[0], modeleBillardAmericain.getTrou(i)[1], RAYON_TROU);
        }

        getChildren().add(fond);
        for (Circle trou : trous) {
            trou.getStyleClass().add("trou");
            trou.setFill(Color.BLACK);
            getChildren().add(trou);
        }
    }

    @Override
    public void update(Sujet s) {
        ModeleBillardAmericain modele = (ModeleBillardAmericain) s;
        for (Observateur vueAUpdate : vuesAUpdate) {
            vueAUpdate.update(modele);
        }
    }

    public void ajouterVue(Observateur vue) {
        getChildren().add((Node) vue);
        vuesAUpdate.add(vue);
    }
}
