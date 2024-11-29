document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvasOutputVideo");
    const ctx = canvas.getContext("2d");

    // Accéder à la caméra
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

        navigator.mediaDevices.getUserMedia({ video:         {
                width:{
                    exact: 1024
                },
                height:{
                    exact: 768
                }
            }, audio: false })
            .then((stream) => {
                // Créer une vidéo virtuelle pour récupérer les frames du flux caméra
                const video = document.createElement("video");
                video.srcObject = stream;
                video.play();

                // Une fois que la vidéo est prête, on commence le traitement
                video.addEventListener("loadeddata", () => {
                    // Lancer la boucle de traitement vidéo
                    processVideo(video, canvas, ctx);
                });
            })
            .catch((error) => {
                console.error("Erreur d'accès à la caméra :", error);
            });
    } else {
        console.error("getUserMedia n'est pas supporté par ce navigateur.");
    }
});

function processVideo(video, canvas, ctx) {
    const FPS = 30;
    const frame = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);

    function processFrame() {
        try {
            let begin = Date.now();

            // Capturer la frame depuis la vidéo dans un canvas temporaire
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Convertir le frame en une matrice OpenCV
            frame.data.set(imageData.data);

            // transformation de l'image
            let gray = new cv.Mat();
            let blurred = new cv.Mat();
            cv.medianBlur(frame, blurred, 7); // flou
            cv.cvtColor(blurred, gray, cv.COLOR_RGBA2GRAY); // niveau de gris


            /*****************************************************/
            /*************** Détection des cercles ***************/
            /*****************************************************/


            let circles = new cv.Mat();
            cv.HoughCircles(gray, circles, cv.HOUGH_GRADIENT,
                2,      // résolution 1 = résolution par défaut, 2 = résolution divisée par 2
                20,     // distance entre les cercles
                100,    // plus c'est bas plus il trouve de cercles
                30,     //
                10,     // diamètre minimum des boules
                18      // diamètre maximum des boules
            );

            // Dessiner les cercles détectés
            for (let i = 0; i < circles.cols; ++i) {
                let circle = circles.data32F.slice(i * 3, (i + 1) * 3);
                let center = new cv.Point(circle[0], circle[1]);
                let radius = circle[2];
                cv.circle(frame, center, radius, [255, 0, 0, 255], 3);
                cv.circle(frame, center, 3, [0, 255, 0, 255], -1);
            }


            /*****************************************************/
            /*************** Détection de l'AruCo ****************/
            /*****************************************************/

            // TODO

            // Afficher le résultat final dans le canvas
            cv.imshow(canvas, frame);

            // Nettoyer la mémoire
            gray.delete();
            blurred.delete();
            circles.delete();

            let delay = 1000 / FPS - (Date.now() - begin);
            setTimeout(processFrame, delay);
        } catch (err) {
            console.error(err);
        }
    }

    // Lancer la boucle de traitement
    processFrame();
}
