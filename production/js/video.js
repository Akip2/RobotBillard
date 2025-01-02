let stillContinue = true;

const WIDTH = 700;
const HEIGHT = 400;

function distanceBetweenPoints(p1, p2) {
    return Math.sqrt(
        Math.pow(p1.x - p1.y, 2) + Math.pow(p2.x - p2.y, 2)
    );
}

function calculateBallSize(tableLength) {
    let ballRealSize = 4.5;
    let tableRealSize = 118.5;

    return (tableLength * ballRealSize) / tableRealSize;
}

/**
 * Sorts the corners given to a specific order
 * (topLeft, topRight, bottomRight, bottomLeft)
 * @param corners the ArUco corners list
 * @returns {*[]} the sorted list
 */
function sortCorners(corners) {
    let topLeft, topRight, bottomLeft, bottomRight;

    for (let i = 0; i < corners.length; i++) {
        let x = corners[i][0];
        let y = corners[i][1];

        // Separate the table in 4 areas, topLeft, BottomRight...
        if ((x > 0 && x < WIDTH / 2) && (y > 0 && y < HEIGHT / 2))
            topLeft = new cv.Point(x, y);
        if ((x > WIDTH / 2 && x < WIDTH) && (y > 0 && y < HEIGHT / 2))
            topRight = new cv.Point(x, y);
        if ((x > WIDTH / 2 && x < WIDTH) && (y > HEIGHT / 2 && y < HEIGHT))
            bottomRight = new cv.Point(x, y);
        if ((x > 0 && x < WIDTH / 2) && (y > HEIGHT / 2 && y < HEIGHT))
            bottomLeft = new cv.Point(x, y);
    }

    return [topLeft, topRight, bottomRight, bottomLeft];
}

/**
 * Process the video and draws detected things
 * @param video
 * @param canvas
 * @param ctx
 */
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

                // Transform the image (grayscale, blurr...)
                let gray = new cv.Mat();
                let blurred = new cv.Mat();
                cv.medianBlur(frame, blurred, 7); // blurr
                cv.cvtColor(blurred, gray, cv.COLOR_RGBA2GRAY); // grayscale

                /*****************************************************/
                /****************** AruCo Detection ******************/
                /*****************************************************/

                let markerImage = new cv.Mat();
                let dictionary = cv.getPredefinedDictionary(cv.DICT_ARUCO_ORIGINAL);

                cv.cvtColor(frame, markerImage, cv.COLOR_RGBA2RGB);

                // Detect ArUco markers
                let markerCorners = new cv.MatVector();
                let markerIds = new cv.Mat();

                let detectionParams = new cv.aruco_DetectorParameters();
                let refineParams = new cv.aruco_RefineParameters(10, 3, true);
                let detector = new cv.aruco_ArucoDetector(dictionary, detectionParams, refineParams)

                detector.detectMarkers(markerImage, markerCorners, markerIds);
                cv.drawDetectedMarkers(markerImage, markerCorners, markerIds);

                // Deduce the corners, and the size of the table
                let tab = [];

                for (let i = 0; i < markerIds.rows; i++) {
                    let corners = markerCorners.get(i);
                    let topLeftCorner = corners.data32F.slice(0, 2);
                    tab.push(topLeftCorner);
                    // console.log(`Id: ${markerIds.data32S[i]}, x: ${topLeftCorner[0]}, y: ${topLeftCorner[1]}`);
                }

                // Draw lines between each ArUco
                let corners = sortCorners(tab);

                if (!corners.includes(undefined)) {
                    for (let i = 0; i < corners.length-1; i++) {
                        cv.line(markerImage, corners[i], corners[i+1], [0, 255, 0, 255], 2); // [0, 255, 0, 255] green
                    }
                    // To make a full rectangle
                    cv.line(markerImage, corners[0], corners[corners.length - 1], [0, 255, 0, 255], 2);
                }

                let topLeft = corners[0];
                let topRight = corners[1];
                let bottomLeft = corners[2];
                let bottomRight = corners[3];

                /*****************************************************/
                /****************** Circle detection *****************/
                /*****************************************************/

                let ballDiameter = 10;

                if (topLeft !== undefined && bottomLeft !== undefined) {
                    ballDiameter = calculateBallSize(distanceBetweenPoints(topLeft, bottomLeft));
                }

                let margin = (20 / 100) * ballDiameter;
                let minDiameter = ballDiameter - margin;
                let maxDiameter = ballDiameter + margin;

                let circles = new cv.Mat();

                cv.HoughCircles(gray, circles, cv.HOUGH_GRADIENT,
                    2,              // resolution : 1 = default resolution, 2 = resolution divided by 2
                    15,             // distance between circles
                    100,            // the lower it is, the more circles are detected (including false ones)
                    30,             //
                    // 7,           // minimum diameter of circles
                    // 15
                    minDiameter,    // minimum diameter of circles
                    maxDiameter     // maximum diameter of circles
                );

                // Draw detected circles
                for (let i = 0; i < circles.cols; ++i) {
                    let circle = circles.data32F.slice(i * 3, (i + 1) * 3);
                    let x = circle[0];
                    let y = circle[1];
                    let center = new cv.Point(x, y);

                    // Only if inside the table
                    // if ((topLeft !== undefined) && (topRight !== undefined) && (bottomLeft !== undefined) && (bottomRight !== undefined)) {
                    //     if (x > topLeft.x && (x > bottomLeft.x) && (x < topRight.x) && (x < bottomRight.x)) {
                    //         if ((y > topLeft.y) && (y < bottomLeft.y) && (y > topRight.y) && (y < bottomRight.y)) {
                                let radius = circle[2];
                                cv.circle(markerImage, center, radius, [255, 0, 0, 255], 3);
                                cv.circle(markerImage, center, 3, [0, 255, 0, 255], -1);
                        //     }
                        // }
                    // }
                }

                // Draw the final result in the canvas
                cv.imshow(canvas, markerImage);

                // Clean memory
                gray.delete();
                blurred.delete();
                circles.delete();

                dictionary.delete();
                detectionParams.delete();
                refineParams.delete();
                detector.delete();
                markerImage.delete();
                markerCorners.delete();
                markerIds.delete();

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

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas-output-video");
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

export function setSillContinue(boolean) {
    stillContinue = boolean;
}
