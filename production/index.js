const socket = io(); //Connexion au serveur

let listeVues = document.querySelector("#liste-boutons");

let vueCamera = document.querySelector("#partie-droite-camera");
// let vueSimulateur = document.querySelector("#partie-droite-simulateur");
let vueManuel = document.querySelector("#partie-droite-manuel");

const btnForward=document.getElementById("btn-avancer");
const btnBackward=document.getElementById("btn-reculer");
const btnLeftTurn=document.getElementById("btn-tourner-a-gauche");
const btnRightTurn=document.getElementById("btn-tourner-a-droite");

const speed=130;
// let vueActive = vueCamera;

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
                console.log("camera");
                console.log(vueCamera.classList);
                if(vueCamera.classList.contains("displayNone")) {
                    console.log("displayNone = oui");
                    vueCamera.classList.remove("displayNone");
                    vueCamera.classList.add("displayFlex");

                    // if(vueSimulateur.classList.contains("displayFlex")) {
                    //     vueSimulateur.classList.remove("displayFlex");
                    //     vueSimulateur.classList.add("displayNone");
                    // }
                    if(vueManuel.classList.contains("displayFlex")) {
                        vueManuel.classList.remove("displayFlex");
                        vueManuel.classList.add("displayNone");
                    }
                }
                break;
            // case "simulateur":
            //     if(vueSimulateur.classList.contains("displayNone")) {
            //         vueSimulateur.classList.remove("displayNone");
            //         vueSimulateur.classList.add("displayFlex");
            //
            //         if(vueCamera.classList.contains("displayFlex")) {
            //             vueCamera.classList.remove("displayFlex");
            //             vueCamera.classList.add("displayNone");
            //         }
            //         if(vueManuel.classList.contains("displayFlex")) {
            //             vueManuel.classList.remove("displayFlex");
            //             vueManuel.classList.add("displayNone");
            //         }
            //     }
            //     break;
            case "manuel":
                console.log("manuel");
                if(vueManuel.classList.contains("displayNone")) {
                    console.log("displayNone = oui");

                    vueManuel.classList.remove("displayNone");
                    vueManuel.classList.add("displayFlex");

                    if(vueCamera.classList.contains("displayFlex")) {
                        vueCamera.classList.remove("displayFlex");
                        vueCamera.classList.add("displayNone");
                    }
                    // if(vueSimulateur.classList.contains("displayFlex")) {
                    //     vueSimulateur.classList.remove("displayFlex");
                    //     vueSimulateur.classList.add("displayNone");
                    // }
                }
                break;
            default:
                console.log("Erreur : vue inconnue");
        }
    });
})

