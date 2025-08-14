package com.example.simulateur.modeles;


import javafx.animation.AnimationTimer;

import java.util.ArrayList;
import java.util.List;

public class Updater{
    private List<ObjetBillard> objetsBillard;
    private ModeleBillardAmericain modeleBillardAmericain;

    public Updater(ModeleBillardAmericain modeleBillardAmericain) {
        this.modeleBillardAmericain = modeleBillardAmericain;
        this.objetsBillard = new ArrayList<>();
    }

    public void ajouterObjetBillard(ObjetBillard... objetBillard) {
        objetsBillard.addAll(List.of(objetBillard));
    }

    public void update() {
        for (ObjetBillard objetBillard : objetsBillard) {
            if(objetBillard.elimine)
                continue;
            objetBillard.update();
            //verification des collisions avec les autres objets
            for (ObjetBillard objetBillard2 : objetsBillard) {
                if (objetBillard != objetBillard2) {
                    double distance = Math.sqrt(Math.pow(objetBillard.getX() - objetBillard2.getX(), 2) + Math.pow(objetBillard.getY() - objetBillard2.getY(), 2));
                    if (distance < objetBillard.getRayon() + objetBillard2.getRayon()) {
                        objetBillard.collisionAvec(objetBillard2);
                    }
                }
            }
            //verification de si l'objet est tombé dans un trou (si c'est une boule)
            if (objetBillard instanceof Boule) {
                for (int i = 0; i < 6; i++) {
                    double distance = Math.sqrt(Math.pow(objetBillard.getX() - modeleBillardAmericain.getTrou(i)[0], 2) + Math.pow(objetBillard.getY() - modeleBillardAmericain.getTrou(i)[1], 2));
                    if (distance < objetBillard.getRayon() + ModeleBillardAmericain.RAYON_TROU) {
                        modeleBillardAmericain.retirerBoule((Boule) objetBillard);
                    }
                }
            }
            if(objetBillard instanceof Boule)
                ((Boule) objetBillard).ralentir(1-ModeleBillardAmericain.COEFF_FROTTEMENTS_BOULES);
        }
        modeleBillardAmericain.notifierObservateurs();
    }
}
