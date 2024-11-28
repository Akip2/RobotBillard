function main() {
    document.getElementById("status").innerHTML = "OpenCV.js is ready.";

    let video = document.getElementById('videoInput');
    let cap = new cv.VideoCapture(video);

    // Prepare frame
    let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);

    // Set the FPS for processing
    const FPS = 30;

    function processVideo() {
        try {
            let begin = Date.now(); // date de début de l'analyse d'une frame

            // On récupère une frame de la vidéo
            cap.read(frame);

            // On applique un flou sur le frame
            let blurred = new cv.Mat();
            // cv.GaussianBlur(frame, blurred, new cv.Size(9, 9), 5, 5);
            cv.medianBlur(frame, blurred, 7);

            // On applique un niveau de gris au frame
            let gray = new cv.Mat();
            cv.cvtColor(blurred, gray, cv.COLOR_RGBA2GRAY);

            // On détecte des cercles avec la méthode HoughCircles
            let circles = new cv.Mat();
            cv.HoughCircles(gray, circles, cv.HOUGH_GRADIENT,
                2,      // résolution 1 = résolution par défaut, 2 = résolution divisée par 2
                20,     // distance entre les cercles
                100,    //
                30,     //
                10,     // diamètre minimum des boules
                18      // diamètre maximum des boules
            );

            // On dessine chaque cercle
            for (let i = 0; i < circles.cols; ++i) {
                let circle = circles.data32F.slice(i * 3, (i + 1) * 3); // circle is [x, y, radius]
                let center = new cv.Point(circle[0], circle[1]);
                let radius = circle[2];

                // On dessine le centre du cerle
                cv.circle(frame, center, 3, [0, 255, 0, 255], -1);

                // On dessine le contour du cercle
                cv.circle(frame, center, radius, [255, 0, 0, 255], 3);
            }

            // Show the frame with detected circles
            cv.imshow('canvasOutputVideo', frame);

            // Clean up memory
            gray.delete();
            blurred.delete();
            circles.delete();

            // Schedule the next frame
            let delay = 1000 / FPS - (Date.now() - begin);
            setTimeout(processVideo, delay);
        } catch (err) {
            console.log(err);
        }
    }

    // Start the processing loop
    setTimeout(processVideo, 0);
}

const Module = {
    onRuntimeInitialized() {
        main();
    }
}
