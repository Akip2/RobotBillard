let stillContinue = true;

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas-output-video");
    const ctx = canvas.getContext("2d");

    // Access camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Use this code when you want to use an external camera, to change ratio of the empty one
        navigator.mediaDevices.getUserMedia({
            video: {
                width: {
                    ideal: 700
                },
                height: {
                    ideal: 400
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

function processVideo(video, canvas, ctx) {
    const FPS = 30;
    const frame = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
    let delay;

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

                /*****************************************************/
                /****************** Circle detection *****************/
                /*****************************************************/

                // let ballDiameter = calculateBallSize(/* TODO */);
                // let minDiameter = ballDiameter - 5;
                // let maxDiameter = ballDiameter + 5;


                let circles = new cv.Mat();
                cv.HoughCircles(gray, circles, cv.HOUGH_GRADIENT,
                    2,              // resolution : 1 = default resolution, 2 = resolution divided by 2
                    15,             // distance between circles
                    100,            // the lower it is, the more circles are detected (including false ones)
                    30,             //
                    7,              // minimum diameter of circles
                    15
                    // minDiameter,    // minimum diameter of circles
                    // maxDiameter     // maximum diameter of circles
                );

                // Draw detected circles
                for (let i = 0; i < circles.cols; ++i) {
                    let circle = circles.data32F.slice(i * 3, (i + 1) * 3);
                    let center = new cv.Point(circle[0], circle[1]);
                    let radius = circle[2];
                    cv.circle(markerImage, center, radius, [255, 0, 0, 255], 3);
                    cv.circle(markerImage, center, 3, [0, 255, 0, 255], -1);

                    console.log(`cercle, x: ${circle[0]}, y: ${circle[1]}, distance: ${distanceBetweenPoints(circle, circles)}`);
                }

                // console.log("Number of circles : " + circles.cols);
                // console.log("Number of aruco : " + markerIds.rows)

                for (let i = 0; i < markerIds.rows; i++) {
                    let corners = markerCorners.get(i);
                    let topLeftCorner = corners.data32F.slice(0, 2);

                    console.log(`Id: ${markerIds.data32S[i]}, x: ${topLeftCorner[0]}, y: ${topLeftCorner[1]}`);
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
            } catch (err) {
                console.error(err);
            }
        }
        setTimeout(processFrame, delay);
    }

    // Process the next frame
    processFrame();
}

/**
 * Calculates the distance between 2 points
 * @param p1
 * @param p2
 * @returns {number}
 */
function distanceBetweenPoints(p1, p2) {
    return Math.sqrt(
        Math.pow(p1[0] - p1[1], 2) + Math.pow(p2[0] - p2[1], 2)
    );
}

/**
 * calculate the approximate size of a boll on the canvas
 * @param {number} tableLength - length of the table on the canvas
 * @returns {number} approximate diameter of balls on the canvas
 */
function calculateBallSize(tableLength) {
    let ballRealSize = 5.5;
    let tableRealSize = 118.5;

    return (tableLength * ballRealSize) / tableRealSize;
}

export function setSillContinue(boolean) {
    stillContinue = boolean;
}
