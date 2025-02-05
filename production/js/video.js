import {detectAndDrawArucos, detectCircles, drawDetectedCircles, preProcess} from "./video-functions.js";
import {calculateBallSize, distanceBetweenPoints} from "./brain.js";

let stillContinue = true;
let robots = [];

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas-output-video");
    const ctx = canvas.getContext("2d");

    // Access camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Use this code when you want to use an external camera, to change ratio of the empty one
        navigator.mediaDevices.getUserMedia({
            video: {
                width: {
                    ideal: 350
                },
                height: {
                    ideal: 200
                }
            }
        })

            // To use a prerecorded video instead
            // .then((stream) => {
            //     // Create a virtual video to get the frames of the camera stream
            //     const video = document.getElementById("canvas-input-video");
            //     video.play();
            //
            //     // Launch the loop of video processing
            //     processVideo(video, canvas, ctx);
            // })

            // To use the PC webcam
            // navigator.mediaDevices.getUserMedia({video: true})
            .then((stream) => {
                // Create a virtual video to get the frames of the camera stream
                const video = document.createElement("video");
                video.srcObject = stream;
                video.play();

                // When video is ready, start processing
                video.addEventListener("loadeddata", () => {
                    // Launch the loop of video processing
                    processVideo(video, canvas, ctx);
                });
            })
            .catch((error) => {
                console.log("Camera access error :", error);
            });
    } else {
        console.log("getUserMedia isn't supported by your browser.");
    }
});

function processVideo(video, canvas, ctx) {
    let delay;
    const FPS = 30;
    const frame = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);

    function processFrame() {
        if (stillContinue) {
            try {
                let begin = Date.now();

                // Capture the frame of the video in a temporary canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                // Convert the frame in an OpenCV matrix
                frame.data.set(imageData.data);

                let finalImage = new cv.Mat();
                let preProcessedFrame = preProcess(frame);
                cv.cvtColor(frame, finalImage, cv.COLOR_RGBA2RGB);

                // AruCo detection
                let arucos = detectAndDrawArucos(finalImage);

                let corners = arucos.slice(0, 4);
                let [topLeft, topRight, bottomRight, bottomLeft] = corners;
                robots = arucos.slice(4, arucos.length);

                const markersVector = new cv.MatVector();
                const mv = new cv.Mat(corners.length, 1, cv.CV_32SC2);

                let ballRadius = 10;
                let isPerimeterFound = false;

                // If the 4 table corners are detected, draw them and lines between them
                if (topLeft && topRight && bottomLeft && bottomRight) {
                    let points = [
                        {x: topLeft.x, y: topLeft.y},
                        {x: topRight.x, y: topRight.y},
                        {x: bottomRight.x, y: bottomRight.y},
                        {x: bottomLeft.x, y: bottomLeft.y},
                    ];

                    points.forEach(({x, y}, idx) => {
                        mv.intPtr(idx, 0)[0] = x;
                        mv.intPtr(idx, 0)[1] = y;
                    });

                    markersVector.push_back(mv);
                    cv.polylines(finalImage, markersVector, true, new cv.Scalar(0, 255, 0), 4);

                    // We can deduce some parameters as well
                    ballRadius = calculateBallSize(distanceBetweenPoints(topLeft, bottomLeft));
                    isPerimeterFound = true;
                }

                // Detect and draw the circles
                let circles = detectCircles(preProcessedFrame, ballRadius);
                drawDetectedCircles(finalImage, circles, mv, isPerimeterFound);

                // Draw the final result in the canvas
                cv.imshow(canvas, finalImage);

                // Clean memory
                preProcessedFrame.delete();
                circles.delete();
                finalImage.delete();

                delay = 1000 / FPS - (Date.now() - begin);
            } catch
                (err) {
                console.error(err);
            }
        }

        setTimeout(processFrame, delay);
    }

    // Process the next frame
    processFrame();
}

export function setStillContinue(boolean) {
    stillContinue = boolean;
}

export function getRealRobots() {
    return robots;
}

export function getRealRobot(index) {
    // console.log(robots)
    return robots[index];
}