import {detectAndDrawArucos, detectCircles, drawDetectedCircles, preProcess} from "./video-functions.js";
import {calculateBallSize, distanceBetweenPoints} from "../brain/brain.js";
import {DEFAULT_BALL_RADIUS, FPS, HEIGHT, WIDTH} from "./video-parameters.js";

let stillContinue = true;
let robots = [];

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas-output-video");
    const canvasBrut = document.getElementById("canvas-output-video-brut");
    const ctx = canvas.getContext("2d");

    // Access camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

        // Use this code when you want to use an external camera, to change ratio of the empty one
        navigator.mediaDevices.getUserMedia({
            video: {
                width: {
                    ideal: WIDTH
                },
                height: {
                    ideal: HEIGHT
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
                    processVideo(video, canvas, canvasBrut, ctx);
                });
            })
            .catch((error) => {
                console.log("Camera access error :", error);
            });
    } else {
        console.log("getUserMedia isn't supported by your browser.");
    }
});

function processVideo(video, canvas, canvasBrut, ctx) {
    let delay;
    const frame = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);

    function processFrame() {
        if (stillContinue) {
            try {
                let begin = Date.now();

                // frame brut
                cv.imshow(canvasBrut, frame);

                // Capture the frame of the video in a temporary canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                // Convert the frame in an OpenCV matrix
                frame.data.set(imageData.data);

                let finalImage = new cv.Mat();
                let preProcessedFrame = preProcess(frame);
                cv.cvtColor(frame, finalImage, cv.COLOR_RGBA2RGB);

                // AruCo detection
                let arucos = detectAndDrawArucos(finalImage);
                const tableCorners = arucos.slice(0, 4);
                const [topLeft, topRight, bottomRight, bottomLeft] = tableCorners;

                robots = arucos.slice(4, arucos.length);

                const mv = new cv.Mat(tableCorners.length, 1, cv.CV_32SC2);

                let ballRadius = DEFAULT_BALL_RADIUS;
                let isPerimeterFound = false;

                // If the 4 table corners are detected, draw them and lines between them
                if (topLeft && topRight && bottomLeft && bottomRight) {
                    const markersVector = new cv.MatVector();

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
                drawDetectedCircles(finalImage, circles, mv, robots, tableCorners, isPerimeterFound);

                // Draw the final result in the canvas
                // preProcessedFrame
                cv.imshow(canvas, finalImage);

                // Clean memory
                finalImage.delete();
                preProcessedFrame.delete();
                mv.delete();
                circles.delete();

                delay = 1000 / FPS - (Date.now() - begin);
            } catch (err) {
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

export function getRealRobot(index) {
    return robots[index];
}
