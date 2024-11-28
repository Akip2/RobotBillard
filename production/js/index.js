const socket = io(); //Connexion au serveur

let listeVues = document.querySelector("#liste-boutons");

let vueCamera = document.querySelector("#partie-droite-camera");
let vueSimulateur = document.querySelector("#partie-droite-simulateur");
let vueManuel = document.querySelector("#partie-droite-manuel");

let divCanvas = document.querySelector("#canvas-container");
let canvas = document.querySelector("#canvasOutputVideo");


const btnForward=document.getElementById("btn-avancer");
const btnBackward=document.getElementById("btn-reculer");
const btnLeftTurn=document.getElementById("btn-tourner-a-gauche");
const btnRightTurn=document.getElementById("btn-tourner-a-droite");

const speed=130;
let vueActive = getVueActive();

function createOrder(left, right, durationLeft=1000, durationRight=1000) {
    return {
        left: left,
        right: right,
        durationLeft: durationLeft,
        durationRight: durationRight,
        time: Date.now(),
    };
}

window.addEventListener("load", () => {
    btnForward.addEventListener("click", () => {
        socket.emit('motor', createOrder(speed, speed));
    });

    btnBackward.addEventListener("click", () => {
        socket.emit('motor', createOrder(-speed, -speed));
    });

    btnRightTurn.addEventListener("click", () => {
        socket.emit('motor', createOrder(-speed, speed));
    });

    btnLeftTurn.addEventListener("click", () => {
        socket.emit('motor', createOrder(speed, -speed));
    });

    listeVues.addEventListener("click", (event) => {
        switch (event.target.id){
            case "camera":
                if (vueActive === vueSimulateur){
                    updateVueActive(vueCamera);
                    divCanvas.appendChild(canvas);
                }
                updateVueActive(vueCamera);
                break;
            case "simulateur":
                if (vueActive !== vueSimulateur){
                    updateVueActive(vueSimulateur);
                    divCanvas.removeChild(canvas);
                }
                break;
            case "manuel":
                if (vueActive === vueSimulateur){
                    updateVueActive(vueManuel);
                    divCanvas.appendChild(canvas);
                }
                updateVueActive(vueManuel);
                break;
            default:
                console.log("Erreur : vue inconnue");
        }
    });
})

function getVueActive() {
    if(vueCamera.classList.contains("displayFlex")) {
        return vueCamera;
    }else if(vueSimulateur.classList.contains("displayFlex")){
        return vueSimulateur;
    }else{
        return vueManuel;
    }
}

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

