package com.example.simulateur.modeles;

public class Boule extends ObjetBillard {
    private int numero;

    public Boule(double x, double y, double rayon, int numero) {
        super(x, y, rayon);
        this.numero = numero;
        this.masse = ModeleBillardAmericain.MASSE_BOULE;
    }

    public int getNumero() {
        return numero;
    }

    @Override
    public void collisionAvec(ObjetBillard objetBillard) {
        double distance = Math.sqrt(Math.pow(x - objetBillard.x, 2) + Math.pow(y - objetBillard.y, 2));
        if (distance < rayon + objetBillard.rayon) {
            double angle = Math.atan2(objetBillard.y - y, objetBillard.x - x);
            double overlap = rayon + objetBillard.rayon - distance;
            x -= overlap * Math.cos(angle);
            y -= overlap * Math.sin(angle);
            double v1 = Math.sqrt(vx * vx + vy * vy);
            double v2 = Math.sqrt(objetBillard.vx * objetBillard.vx + objetBillard.vy * objetBillard.vy);
            double m1 = masse;
            double m2 = objetBillard.masse;
            double theta1 = Math.atan2(vy, vx);
            double theta2 = Math.atan2(objetBillard.vy, objetBillard.vx);
            double phi = Math.atan2(objetBillard.y - y, objetBillard.x - x);
            double v1x = v1 * Math.cos(theta1 - phi);
            double v1y = v1 * Math.sin(theta1 - phi);
            double v2x = v2 * Math.cos(theta2 - phi);
            double v2y = v2 * Math.sin(theta2 - phi);
            double finalV1x = ((m1 - m2) * v1x + 2 * m2 * v2x) / (m1 + m2);
            double finalV2x = (2 * m1 * v1x + (m2 - m1) * v2x) / (m1 + m2);
            vx = Math.cos(phi) * finalV1x + Math.cos(phi + Math.PI / 2) * v1y;
            vy = Math.sin(phi) * finalV1x + Math.sin(phi + Math.PI / 2) * v1y;
            if(objetBillard instanceof Boule) {
                objetBillard.vx = Math.cos(phi) * finalV2x + Math.cos(phi + Math.PI / 2) * v2y;
                objetBillard.vy = Math.sin(phi) * finalV2x + Math.sin(phi + Math.PI / 2) * v2y;
            }
        }
    }

    @Override
    public void collisionAvecBandes() {
        // Si la boule touche une des bandes verticales
        if (x <= ModeleBillardAmericain.EPAISSEUR_BANDE + rayon || x >= ModeleBillardAmericain.LARGEUR - ModeleBillardAmericain.EPAISSEUR_BANDE - rayon) {
            vx = -vx;
        }
        // Si la boule touche une des bandes horizontales
        if (y <= ModeleBillardAmericain.EPAISSEUR_BANDE + rayon || y >= ModeleBillardAmericain.HAUTEUR - ModeleBillardAmericain.EPAISSEUR_BANDE - rayon) {
            vy = -vy;
        }
    }

    public void ralentir(double ralentissement) {
        vx *= ralentissement;
        vy *= ralentissement;
        if(Math.abs(vx) < ModeleBillardAmericain.TOLERANCE_VITESSE_NULLE && Math.abs(vy) < ModeleBillardAmericain.TOLERANCE_VITESSE_NULLE) {
            vx = 0;
            vy = 0;
        }
    }
}
