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

            let isNearRobot = false;
            for (let j = 0; j < robots.length && !isNearRobot; j++) {
                isNearRobot = distanceBetweenPoints(circleCenter, robots[j].position) < ballRadius * 3;
            }

            if (!isNearRobot) {
                const holes = this.table.holes;

                let isNearHole = false;
                for (let j = 0; j < holes.length && !isNearHole; j++) {
                    const hole = holes[j].body;
                    isNearHole = distanceBetweenPoints(circleCenter, hole.position) < ballRadius * 2;
                }

                if (!isNearHole) {
                    ballsDetected.push(circleCenter);
                }
            }
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
