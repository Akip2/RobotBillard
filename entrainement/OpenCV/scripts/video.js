function main() {
    document.getElementById("status").innerHTML = "OpenCV.js is ready.";

    let video = document.getElementById('videoInput');
    let cap = new cv.VideoCapture(video);

    // Prepare frame
    let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);

    // Set the FPS for processing
    const FPS = 60;

    function processVideo() {
        try {
            let begin = Date.now();

            // Capture a frame from the video
            cap.read(frame);

            // Convert the frame to grayscale as HoughCircles works on grayscale images
            let gray = new cv.Mat();
            cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY);

            // Use GaussianBlur to reduce noise and improve circle detection
            // let blurred = new cv.Mat();
            // cv.GaussianBlur(gray, blurred, new cv.Size(9, 9), 2, 2);

            // Detect circles in the frame using Hough Transform
            let circles = new cv.Mat();
            cv.HoughCircles(gray , circles, cv.HOUGH_GRADIENT,
                2, 10, 100, 30, 10, 15);

            // Draw detected circles
            for (let i = 0; i < circles.cols; ++i) {
                let circle = circles.data32F.slice(i * 3, (i + 1) * 3); // circle is [x, y, radius]
                let center = new cv.Point(circle[0], circle[1]);
                let radius = circle[2];

                // Draw the circle's center
                cv.circle(frame, center, 3, [0, 255, 0, 255], -1);

                // Draw the circle's outline
                cv.circle(frame, center, radius, [255, 0, 0, 255], 3);
            }

            // Show the frame with detected circles
            cv.imshow('canvasOutputVideo', frame);

            // Clean up memory
            gray.delete();
            // blurred.delete();
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

// export default {
//     main: main
// }