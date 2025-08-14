package com.example.simulateur.modeles;

public abstract class ObjetBillard {
    protected double x;
    protected double y;
    protected double rayon;
    protected double masse;
    protected double vx;
    protected double vy;
    public boolean elimine = false;

    public ObjetBillard(double x, double y, double rayon) {
        this.x = x;
        this.y = y;
        this.rayon = rayon;
    }

    public double getX() {
        return x;
    }

    public double getY() {
        return y;
    }

    public double getRayon() {
        return rayon;
    }

    public void setX(double x) {
        this.x = x;
    }

    public void setRayon(double rayon) {
        this.rayon = rayon;
    }

    public void setY(double y) {
        this.y = y;
    }

    public double getVx() {
        return vx;
    }

    public double getVy() {
        return vy;
    }

    public void update() {
        if(elimine)
            return;
        //update des positions
        x += vx;
        y += vy;
        //verification des collisions avec les bandes
        boolean collision = false;
        if(x < ModeleBillardAmericain.EPAISSEUR_BANDE + rayon) {
            x = ModeleBillardAmericain.EPAISSEUR_BANDE + rayon;
            collision = true;
        }
        if(x > ModeleBillardAmericain.LARGEUR - ModeleBillardAmericain.EPAISSEUR_BANDE - rayon) {
            x = ModeleBillardAmericain.LARGEUR - ModeleBillardAmericain.EPAISSEUR_BANDE - rayon;
            collision = true;
        }
        if(y < ModeleBillardAmericain.EPAISSEUR_BANDE + rayon) {
            y = ModeleBillardAmericain.EPAISSEUR_BANDE + rayon;
            collision = true;
        }
        if(y > ModeleBillardAmericain.HAUTEUR - ModeleBillardAmericain.EPAISSEUR_BANDE - rayon) {
            y = ModeleBillardAmericain.HAUTEUR - ModeleBillardAmericain.EPAISSEUR_BANDE - rayon;
            collision = true;
        }
        if(collision) {
            collisionAvecBandes();
        }
    }

    public abstract void collisionAvec(ObjetBillard objetBillard);

    public abstract void collisionAvecBandes();

    public double distance(ObjetBillard objetBillard) {
        return Math.sqrt(Math.pow(x - objetBillard.x, 2) + Math.pow(y - objetBillard.y, 2));
    }

    public double angleVersObjet(ObjetBillard objetBillard) {
        return Math.atan2(objetBillard.y - y, objetBillard.x - x);
    }

    public double angleVersPoint(double x, double y) {
        return Math.atan2(y - this.y, x - this.x);
    }
}
