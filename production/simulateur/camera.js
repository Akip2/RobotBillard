import {ballRadius, simulatorCameraFPS} from "./params.js";
import {detectCircles, preProcess} from "../js/video/video-functions.js";

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

    analyze() {
        try {
            let imgData = cv.imread(this.canvas);
            let preProcessedImg = preProcess(imgData);

            let circles = detectCircles(preProcessedImg, ballRadius);
            let ballsDetected = [];

            for (let i = 0; i < circles.cols; i++) {
                let circle = circles.data32F.slice(i * 3, (i + 1) * 3);
                let center = new cv.Point(circle[0], circle[1]);

                ballsDetected.push(center);
                circle = null;
                center = null;
            }

            this.table.updateDetectedCircles(ballsDetected);

            //Cleaning memory
            preProcessedImg.delete();
            circles.delete();
            imgData.delete();
            ballsDetected = null;
        } catch (err) {
            console.error(err);
        }
    }
}

export default Camera;
