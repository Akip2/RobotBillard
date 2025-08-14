package com.example.simulateur.modeles;

import com.example.simulateur.vues.Observateur;

import java.util.Arrays;
import java.util.List;

public class ModeleBillardAmericain implements Sujet {
    public static int RAYON_BOULE = 29;
    public static double MASSE_BOULE = 0.5;
    public static double COEFF_FROTTEMENTS_BOULES = 0.01;

    public static double MASSE_ROBOT = 3.0;
    public static double RAYON_ROBOT = 71;
    public static final double VITESSE_MAX_MOTEUR_DROIT = 3.0;
    public static final double VITESSE_MAX_MOTEUR_GAUCHE = 3.0;
    public static final int VITESSE_ROTATION = 2;
    public static final double ACCELERATION = 0.1;
    public static final double FREINAGE = 0.1;

    public static double TOLERANCE_VITESSE_NULLE = 0.1;

    public static int EPAISSEUR_BANDE = 50;
    public static final int RAYON_TROU = RAYON_BOULE * 2;
    public static final int LARGEUR = 1270;
    public static final int HAUTEUR = 605;

    public static double TOLERANCE_ANGLE = 0.1;
    public static double ACCELERATION_QUAND_ALIGNE = 1;

    List<Observateur> observateurs;
    Boule[] boules = new Boule[16];
    Robot[] robots = new Robot[1];
    Updater updater = new Updater(this);
    int nombreBoulesRetirees = 0;
    List<int[]> trous;

    public ModeleBillardAmericain() {
        observateurs = new java.util.ArrayList<>();

        // Initialisation des trous
        trous = Arrays.asList(
                new int[]{EPAISSEUR_BANDE, EPAISSEUR_BANDE},
                new int[]{LARGEUR/2, EPAISSEUR_BANDE},
                new int[]{EPAISSEUR_BANDE, HAUTEUR - EPAISSEUR_BANDE},
                new int[]{LARGEUR - EPAISSEUR_BANDE, EPAISSEUR_BANDE},
                new int[]{LARGEUR/2, HAUTEUR - EPAISSEUR_BANDE},
                new int[]{LARGEUR - EPAISSEUR_BANDE, HAUTEUR - EPAISSEUR_BANDE}
        );

        // Boule blanche
        boules[0] = new Boule((double) (LARGEUR) /4, (double) HAUTEUR /2, RAYON_BOULE, 0);

        // Autres boules
        int numBoule = 1;
        int positionXDebutRangee = LARGEUR*3/4;
        int positionYDebutRangee = HAUTEUR/2;
        for (int rangee = 1; rangee < 6; rangee++) {
            for (int bouleDeRangee = 0; bouleDeRangee < rangee; bouleDeRangee++) {
                boules[numBoule] = new Boule(positionXDebutRangee, positionYDebutRangee + bouleDeRangee*RAYON_BOULE*2, RAYON_BOULE, numBoule);
                numBoule++;
            }
            positionXDebutRangee += (int) (RAYON_BOULE*1.8);
            positionYDebutRangee -= RAYON_BOULE;
        }

        // Positionnement du robot entre la boule blanche et la bande gauche
        double robotX = (boules[0].getX() + 20) / 2; // À mi-chemin entre la boule blanche et la bande gauche
        double robotY = boules[0].getY();
        robots[0] = new Robot(robotX, robotY, RAYON_ROBOT);


        initializeUpdater();
    }

    public ModeleBillardAmericain(Boule[] boules, Robot[] robots) {
        observateurs = new java.util.ArrayList<>();
        this.boules = boules;
        this.robots = robots;
        // Initialisation des trous
        trous = Arrays.asList(
                new int[]{EPAISSEUR_BANDE, EPAISSEUR_BANDE},
                new int[]{LARGEUR/2, EPAISSEUR_BANDE},
                new int[]{EPAISSEUR_BANDE, HAUTEUR - EPAISSEUR_BANDE},
                new int[]{LARGEUR - EPAISSEUR_BANDE, EPAISSEUR_BANDE},
                new int[]{LARGEUR/2, HAUTEUR - EPAISSEUR_BANDE},
                new int[]{LARGEUR - EPAISSEUR_BANDE, HAUTEUR - EPAISSEUR_BANDE}
        );
        initializeUpdater();
    }

    public void initializeUpdater() {
        for (Boule boule : boules) {
            updater.ajouterObjetBillard(boule);
        }
        for (Robot robot : robots) {
            updater.ajouterObjetBillard(robot);
        }
    }

    public int[] getTrou(int numero) {
        return trous.get(numero);
    }

    public Updater getUpdater() {
        return updater;
    }

    public Boule[] getBoules() {
        return boules;
    }

    public Robot[] getRobots() {
        return robots;
    }

    public void retirerBoule(Boule boule) {
        boules[boule.getNumero()].setX(LARGEUR+40);
        boules[boule.getNumero()].setY(20+nombreBoulesRetirees*RAYON_BOULE*2.5);
        boules[boule.getNumero()].vx = 0;
        boules[boule.getNumero()].vy = 0;
        boules[boule.getNumero()].elimine = true;
        nombreBoulesRetirees++;
    }

    public Boule getBoulePlusProcheDeRobot() {
        Boule boulePlusProche = null;
        double distanceMin = Double.MAX_VALUE;
        for (Boule boule : boules) {
            if(boule.elimine)
                continue;
            double distance = Math.sqrt(Math.pow(boule.getX() - robots[0].getX(), 2) + Math.pow(boule.getY() - robots[0].getY(), 2));
            if (distance < distanceMin) {
                distanceMin = distance;
                boulePlusProche = boule;
            }
        }
        return boulePlusProche;
    }

    public double getAngleObjetVersTrou(ObjetBillard objetBillard, int numeroTrou) {
        double x = objetBillard.getX();
        double y = objetBillard.getY();
        double xTrou = getTrou(numeroTrou)[0];
        double yTrou = getTrou(numeroTrou)[1];
        return Math.atan2(yTrou - y, xTrou - x);
    }

    public int getIndiceTrouLePlusAligneAvecBoule(Boule boule) {
        int indiceTrouLePlusAligne = -1;
        double angleMin = Double.MAX_VALUE;
        for (int i = 0; i < 6; i++) {
            double angle = Math.abs(getAngleObjetVersTrou(boule, i));
            if (angle < angleMin) {
                angleMin = angle;
                indiceTrouLePlusAligne = i;
            }
        }
        return indiceTrouLePlusAligne;
    }

    public static boolean pointAccessibleParRobot(double xPoint, double yPoint) {
        if(xPoint < EPAISSEUR_BANDE + RAYON_ROBOT || xPoint > LARGEUR - EPAISSEUR_BANDE - RAYON_ROBOT)
            return false;
        if(yPoint < EPAISSEUR_BANDE + RAYON_ROBOT || yPoint > HAUTEUR - EPAISSEUR_BANDE - RAYON_ROBOT)
            return false;
        return true;
    }

    @Override
    public void enregistrerObservateur(Observateur... o) {
        observateurs.addAll(List.of(o));
    }

    @Override
    public void supprimerObservateur(Observateur o) {
        observateurs.remove(o);
    }

    @Override
    public void notifierObservateurs() {
        for (Observateur o : observateurs) {
            o.update(this);
        }
    }
}
