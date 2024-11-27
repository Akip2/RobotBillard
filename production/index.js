let listeVues = document.querySelector("#liste-boutons");

let vueCamera = document.querySelector("#partie-droite-camera");
// let vueSimulateur = document.querySelector("#partie-droite-simulateur");
let vueManuel = document.querySelector("#partie-droite-manuel");

// let vueActive = vueCamera;

window.addEventListener("load", () => {

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

