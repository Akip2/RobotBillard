document.addEventListener("DOMContentLoaded", () => {
    const videoElement = document.getElementById("videoInput");

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                videoElement.srcObject = stream;
            })
            .catch((error) => {
                console.error("Erreur d'accès à la caméra :", error);
            });
    } else {
        console.error("getUserMedia n'est pas supporté par ce navigateur.");
    }
});