module com.example.simulateur {
    requires javafx.controls;
    requires javafx.fxml;


    opens com.example.simulateur to javafx.fxml;
    exports com.example.simulateur;
}