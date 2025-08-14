package com.example.simulateur.modeles;

import com.example.simulateur.vues.Observateur;

public interface Sujet {
    public void enregistrerObservateur(Observateur... o);
    public void supprimerObservateur(Observateur o);
    public void notifierObservateurs();
}
