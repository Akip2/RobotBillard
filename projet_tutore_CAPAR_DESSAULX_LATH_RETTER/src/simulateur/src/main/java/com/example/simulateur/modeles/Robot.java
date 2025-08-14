package com.example.simulateur.modeles;

import javafx.geometry.Point2D;

import static com.example.simulateur.modeles.ModeleBillardAmericain.VITESSE_MAX_MOTEUR_DROIT;
import static com.example.simulateur.modeles.ModeleBillardAmericain.VITESSE_MAX_MOTEUR_GAUCHE;

public class Robot extends ObjetBillard {
    private double direction;
    private double vMD;
    private double vMG;

    public Robot(double x, double y, double rayon) {
        super(x, y, rayon);
        this.direction = 0;
        this.masse = ModeleBillardAmericain.MASSE_ROBOT;
    }

    @Override
    public void collisionAvec(ObjetBillard objetBillard) {

    }

    @Override
    public void collisionAvecBandes() {
        if (getX() < ModeleBillardAmericain.EPAISSEUR_BANDE + getRayon()) {
            setX(ModeleBillardAmericain.EPAISSEUR_BANDE + getRayon());
        }
        if (getX() > ModeleBillardAmericain.LARGEUR - ModeleBillardAmericain.EPAISSEUR_BANDE - getRayon()) {
            setX(ModeleBillardAmericain.LARGEUR - ModeleBillardAmericain.EPAISSEUR_BANDE - getRayon());
        }
        if (getY() < ModeleBillardAmericain.EPAISSEUR_BANDE + getRayon()) {
            setY(ModeleBillardAmericain.EPAISSEUR_BANDE + getRayon());
        }
        if (getY() > ModeleBillardAmericain.HAUTEUR - ModeleBillardAmericain.EPAISSEUR_BANDE - getRayon()) {
            setY(ModeleBillardAmericain.HAUTEUR - ModeleBillardAmericain.EPAISSEUR_BANDE - getRayon());
        }
        stopper();
    }

    public void stopper() {
        vx = 0;
        vy = 0;
        vMD = 0;
        vMG = 0;
    }

    public void setDirection(double direction) {
        if (direction > Math.PI)
            direction -= 2 * Math.PI;
        else if (direction < -Math.PI)
            direction += 2 * Math.PI;
        this.direction = direction;
    }

    public Point2D rotationVecteur(Point2D vecteur, double angle) {
        double xPrime = vecteur.getX() * Math.cos(angle) - vecteur.getY() * Math.sin(angle);
        double yPrime = vecteur.getX() * Math.sin(angle) + vecteur.getY() * Math.cos(angle);
        return new Point2D(xPrime, yPrime);
    }

    public double getDirection() {
            return direction;
    }

    public void accelererMoteurDroit(double acceleration) {
        vMD = vMD + VITESSE_MAX_MOTEUR_DROIT * acceleration;
        if (vMD > VITESSE_MAX_MOTEUR_DROIT)
            vMD = VITESSE_MAX_MOTEUR_DROIT;
        else if (vMD < -VITESSE_MAX_MOTEUR_DROIT)
            vMD = -VITESSE_MAX_MOTEUR_DROIT;
    }

    public void accelererMoteurGauche(double acceleration) {
        vMG = vMG + VITESSE_MAX_MOTEUR_GAUCHE * acceleration;
        if (vMG > VITESSE_MAX_MOTEUR_GAUCHE)
            vMG = VITESSE_MAX_MOTEUR_GAUCHE;
        else if (vMG < -VITESSE_MAX_MOTEUR_GAUCHE)
            vMG = -VITESSE_MAX_MOTEUR_GAUCHE;
    }

    public void freinerMoteurDroit(double freinage) {
        if (vMD > 0)
            vMD = vMD - VITESSE_MAX_MOTEUR_DROIT * freinage;
        else if (vMD < 0)
            vMD = vMD + VITESSE_MAX_MOTEUR_DROIT * freinage;
        if (vMD < ModeleBillardAmericain.TOLERANCE_VITESSE_NULLE && vMD > -ModeleBillardAmericain.TOLERANCE_VITESSE_NULLE)
            vMD = 0;
    }

    public void freinerMoteurGauche(double freinage) {
        if (vMG > 0)
            vMG = vMG - VITESSE_MAX_MOTEUR_GAUCHE * freinage;
        else if (vMG < 0)
            vMG = vMG + VITESSE_MAX_MOTEUR_GAUCHE * freinage;
        if (vMG < ModeleBillardAmericain.TOLERANCE_VITESSE_NULLE && vMG > -ModeleBillardAmericain.TOLERANCE_VITESSE_NULLE)
            vMG = 0;
    }

    public void actualiserVxVy() {
        double vitesse = (vMD + vMG) / 2;
        double vitesseAngulaire = (vMD - vMG) / (2 * rayon);
        Point2D vecteurVitesse = new Point2D(vitesse, 0);
        Point2D vecteurVitesseAngulaire = new Point2D(0, vitesseAngulaire);
        Point2D vecteurVitesseResultant = rotationVecteur(vecteurVitesse, direction);
        Point2D vecteurVitesseAngulaireResultant = rotationVecteur(vecteurVitesseAngulaire, direction);
        vx = vecteurVitesseResultant.getX() + vecteurVitesseAngulaireResultant.getX();
        vy = vecteurVitesseResultant.getY() + vecteurVitesseAngulaireResultant.getY();
    }
}
