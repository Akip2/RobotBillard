import {ballRadius, simulatorCameraFPS} from "./params.js";
import {detectAndDrawArucos, detectCircles, preProcess} from "../js/video/video-functions.js";
import {distanceBetweenPoints} from "../js/brain/brain.js";

class Camera {
    constructor(canvasContainer, table) {
        this.canvasContainer = canvasContainer;
        this.table = table;
        this.analysisInterval = null;
        this.isRunning = false;
    }

    start() {
        this.canvas = this.canvasContainer.querySelector("#canvas-simulateur");
        this.isRunning = true;

        this.analysisInterval = setInterval(() => {
            this.analyze();
        }, 1000 / simulatorCameraFPS)
    }

    stop() {
        this.isRunning = false;
        clearInterval(this.analysisInterval);
    }

    detectCircles(frame) {
        let circles = detectCircles(frame, ballRadius);
        let ballsDetected = [];

        for (let i = 0; i < circles.cols; i++) {
            let circle = circles.data32F.slice(i * 3, (i + 1) * 3);
            let circleCenter = new cv.Point(circle[0], circle[1]);

            const robots = this.table.getRobotsDetected();
            const holes = this.table.holes;

            if (robots !== undefined) {
                for (let j = 0; j < robots.length; j++) {
                    // Check if circle is not on Aruco
                    if (distanceBetweenPoints(circleCenter, robots[j].position) > ballRadius * 3) {
                        let k = 0;
                        let isNearHole = false;

                        while ((k < holes.length) && !isNearHole) {
                            const hole = holes[k].body;

                            // Check if circle is not near holes
                            if (distanceBetweenPoints(circleCenter, hole.position) < ballRadius * 2) {
                                isNearHole = true;
                            }
                            k++;
                        }

                        if (!isNearHole) {
                            ballsDetected.push(circleCenter);
                        }
                    }
                }
            }
            circle = null;
            circleCenter = null;
        }
        circles.delete();

        return ballsDetected;
    }

    analyze() {
        try {
            let imgData = cv.imread(this.canvas);
            let preProcessedImg = preProcess(imgData);

            let robotArucos = detectAndDrawArucos(preProcessedImg);
            this.table.updateDetectedRobots(robotArucos);

            let ballsDetected = this.detectCircles(preProcessedImg);
            this.table.updateDetectedCircles(ballsDetected);

            //Cleaning memory
            preProcessedImg.delete();
            imgData.delete();
            ballsDetected = null;
            robotArucos = null;
        } catch (err) {
            console.error(err);
        }
    }
}

export default Camera;
