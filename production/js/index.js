import VueSimulateur from "../simulateur/vue-simulateur.js";
import RandomConfig from "../simulateur/configurations/random-config.js";
import CollisionController from "../simulateur/collision-controller.js";

const socket = io(); //Connexion au serveur

const listeVues = document.querySelector("#liste-boutons");

const vueCamera = document.querySelector("#partie-droite-camera");
const vueSimulateur = document.querySelector("#partie-droite-simulateur");
const vueManuel = document.querySelector("#partie-droite-manuel");

const canvasContainer = document.querySelector("#canvas-container");
const canvas = document.querySelector("#canvasOutputVideo");

const btnForward=document.getElementById("btn-avancer");
const btnBackward=document.getElementById("btn-reculer");
const btnLeftTurn=document.getElementById("btn-tourner-a-gauche");
const btnRightTurn=document.getElementById("btn-tourner-a-droite");

const curseurMoteurGauche = document.getElementById("curseurMoteurGauche");
const curseurMoteurDroit = document.getElementById("curseurMoteurDroit");
const inputDuration = document.getElementById("inputDuration");

let speedGauche = 130;
let speedDroit = 130;

let duration = 1000;

let vueActive = getVueActive();

function createOrder(left, right, duration) {
    return {
        left: left,
        right: right,
        duration: duration,
        time: Date.now()
    };
}

window.addEventListener("load", () => {
    inputDuration.addEventListener("input", () => {
        let durationAvantVerif = inputDuration.value;
        // on vérifie si le temps est bien compris entre 100 et 10 000 ms
        duration = durationAvantVerif<100 ? 100 : durationAvantVerif>10000 ? 10000 : durationAvantVerif;
        console.log(duration);
    });

    curseurMoteurGauche.addEventListener("input", () => {
        speedGauche = curseurMoteurGauche.value;
    });

    curseurMoteurDroit.addEventListener("input", () => {
        speedDroit = curseurMoteurDroit.value;
    });

    btnForward.addEventListener("click", () => {
        socket.emit('motor', createOrder(speedGauche, speedDroit, duration));
    });

    btnBackward.addEventListener("click", () => {
        socket.emit('motor', createOrder(-speedGauche, -speedDroit, duration));
    });

    btnRightTurn.addEventListener("click", () => {
        socket.emit('motor', createOrder(-speedGauche, speedDroit, duration));
    });

    btnLeftTurn.addEventListener("click", () => {
        socket.emit('motor', createOrder(speedGauche, -speedDroit, duration));
    });

    // changement de la vue courante
    listeVues.addEventListener("click", (event) => {
        switch (event.target.id){
            case "camera": // bouton caméra cliqué -> on affiche la vue Caméra
                if (vueActive === vueSimulateur){
                    updateVueActive(vueCamera);
                    let canvasSimulateur = document.querySelector("#canvas-simulateur");
                    canvasContainer.removeChild(canvasSimulateur); // on supprime le canvas du simulateur
                    canvasContainer.appendChild(canvas);
                }
                updateVueActive(vueCamera);
                break;
            case "simulateur": // bouton simulateur cliqué -> on affiche la vue Simulateur
                if (vueActive !== vueSimulateur){
                    updateVueActive(vueSimulateur);
                    canvasContainer.removeChild(canvas);

                    let vue=new VueSimulateur(canvasContainer);
                    vue.setup();
                    vue.run();

                    let table=new RandomConfig(vue);
                    let colController=new CollisionController(table);
                    colController.createEvent(vue.engine);
                    table.notifyView();
                }
                break;
            case "manuel": // bouton manuel cliqué -> on affiche la vue Manuel
                if (vueActive === vueSimulateur){
                    updateVueActive(vueManuel);
                    let canvasSimulateur = document.querySelector("#canvas-simulateur");
                    canvasContainer.removeChild(canvasSimulateur); // on supprime le canvas du simulateur
                    canvasContainer.appendChild(canvas);
                }
                updateVueActive(vueManuel);
                break;
            default: // dans le cas où on appuie sur un bouton qui n'a pas de vue, on affiche une erreur
                console.log("Erreur : vue inconnue");
        }
    });
})

// fonction qui permet de récupérer la vue courante en vérifiant quelle vue est affichée
// (contient la classe "displayFlex" et non pas "displayNone")
function getVueActive() {
    if(vueCamera.classList.contains("displayFlex")) {
        return vueCamera;
    }else if(vueSimulateur.classList.contains("displayFlex")){
        return vueSimulateur;
    }else{
        return vueManuel;
    }
}

// fonction qui permet de changer la vue active en remplaçant la classe "displayFlex" de la vue active par "displayNone"
// et remplaçant la classe "displayNone" de la nouvelle vue active par "displayFlex"
function updateVueActive(nouvelleVueActive) {
    // on vérifie tout d'abord si la vue active change
    if(nouvelleVueActive.id !== vueActive.id){
        // on retire la classe de la vue active de l'affichage
        vueActive.classList.remove("displayFlex");
        vueActive.classList.add("displayNone");

        // on ajoute la classe de la nouvelle vue active sur la page
        nouvelleVueActive.classList.remove("displayNone");
        nouvelleVueActive.classList.add("displayFlex");

        // on met à jour la vue active
        vueActive = nouvelleVueActive;
    }
}

