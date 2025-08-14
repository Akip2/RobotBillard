package com.example.simulateur;

import com.example.simulateur.controleurs.ControlleurIntelligent;
import com.example.simulateur.controleurs.ControlleurRobotClavier;
import com.example.simulateur.modeles.ModeleBillardAmericain;
import com.example.simulateur.vues.*;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class Main extends Application {
    public static void main(String[] args) {
        launch();
    }

    @Override
    public void start(Stage stage) throws Exception {
        ModeleBillardAmericain modeleBillardAmericain = new ModeleBillardAmericain();
        VueGlobale vueGlobale = new VueGlobale(modeleBillardAmericain);
        modeleBillardAmericain.enregistrerObservateur(vueGlobale);
        ControlleurRobotClavier controlleurRobotClavier = new ControlleurRobotClavier(modeleBillardAmericain);
        ControlleurIntelligent controlleurIntelligent = new ControlleurIntelligent(modeleBillardAmericain);

        Scene scene = new Scene(vueGlobale, ModeleBillardAmericain.LARGEUR, ModeleBillardAmericain.HAUTEUR);
        scene.setOnKeyPressed(controlleurRobotClavier::handleKeyPressed);
        scene.setOnKeyReleased(controlleurRobotClavier::handleKeyReleased);
        stage.setScene(scene);
        stage.show();
    }
}
