import {
    BANNED_ARUCOS,
    BOTTOM_LEFT_ARUCO_ID,
    BOTTOM_RIGHT_ARUCO_ID,
    DEFAULT_BALL_RADIUS,
    HOLE_DISTANCE_FACTOR,
    HOUGH_CIRCLES_DISTANCE_BETWEEN_CIRCLES,
    HOUGH_CIRCLES_PARAMETER_1,
    HOUGH_CIRCLES_PARAMETER_2,
    HOUGH_CIRCLES_RESOLUTION,
    MAXIMUM_HOLES,
    TOP_LEFT_ARUCO_ID,
    TOP_RIGHT_ARUCO_ID
} from "./video-parameters.js";
import {convertCVPointToMathPoint, distanceBetweenPoints, middleOfPoints} from "../brain/brain.js";
import {isSimulator, vue} from "../events/view-manager.js";

let ballsPositions = [];
let holesPositions = [];

export function preProcess(frame) {
    let gray = new cv.Mat();
    let bright = new cv.Mat();

    cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY); // Grayscale
    cv.convertScaleAbs(gray, bright, 1.5, 20); // 1 - 3 // 0 - 100

    // TEST
    /*let mv = new cv.MatVector();
    cv.split(gray, mv);

    let resultPlanes = new cv.MatVector();
    let resultNormPlanes = new cv.MatVector();

    // Process each plane (R, G, B channels)
    for (let i = 0; i < mv.size(); i++) {
        let plane = mv.get(i);

        // Dilate the plane
        let dilatedImg = new cv.Mat();
        cv.dilate(plane, dilatedImg, cv.Mat.ones(7, 7, cv.CV_8UC1));

        // Apply median blur
        let bgImg = new cv.Mat();
        cv.medianBlur(dilatedImg, bgImg, 21);

        // Compute the absolute difference between the original and blurred image
        let diffImg = new cv.Mat();
        cv.absdiff(plane, bgImg, diffImg);

        // Invert the image (255 - diffImg)
        let invertedDiffImg = new cv.Mat();
        cv.bitwise_not(diffImg, invertedDiffImg);

        // Normalize the diff image
        let normImg = new cv.Mat();
        cv.normalize(invertedDiffImg, normImg, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1);

        // Append the diff and norm images to the result arrays
        resultPlanes.push_back(diffImg);
        resultNormPlanes.push_back(normImg);

        // Release temporary matrices
        dilatedImg.delete();
        bgImg.delete();
        invertedDiffImg.delete();
    }

    let result = new cv.Mat();
    cv.merge(resultPlanes, result);

    let resultNorm = new cv.Mat();
    cv.merge(resultNormPlanes, resultNorm);*/

    gray.delete();

    return bright;
}

/**
 * Only draws the direction in which the arucos are facing,
 * doesn't draw the actual arucos themselves
 * @param frame the frame which contains aruco
 * @param cornersOfAruco the 4 corners of an aruco that have already been detected
 * @returns {number} the angle (0 - 360) the aruco provided is facing
 */
export function drawAndGetDirectionOfAruco(frame, cornersOfAruco) {
    let topLeftCornerOfAruco = convertCVPointToMathPoint(cornersOfAruco.data32F.slice(0, 2));
    let topRightCornerOfAruco = convertCVPointToMathPoint(cornersOfAruco.data32F.slice(2, 4));
    let bottomRightCornerOfAruco = convertCVPointToMathPoint(cornersOfAruco.data32F.slice(4, 6));
    let bottomLeftCornerOfAruco = convertCVPointToMathPoint(cornersOfAruco.data32F.slice(6, 8));

    let topCenter = middleOfPoints(topRightCornerOfAruco, topLeftCornerOfAruco);
    let bottomCenter = middleOfPoints(bottomLeftCornerOfAruco, bottomRightCornerOfAruco);

    let angle = Math.atan2(bottomCenter.y - topCenter.y, topCenter.x - bottomCenter.x) * (180 / Math.PI);
    angle < 0 ? angle += 360 : angle;

    cv.line(frame, bottomCenter, topCenter, new cv.Scalar(0, 255, 0), 2);
    cv.rectangle(frame, topCenter, topCenter, new cv.Scalar(255, 0, 0), 15);

    return angle;
}

/**
 * Generate the data structure of a robot aruco
 * @param frame Frame containing the aruco
 * @param cornersOfAruco Corners of the aruco
 * @param arucoId Id of the robot aruco
 */
function generateArucoData(frame, cornersOfAruco, arucoId) {
    const bottomRightCornerOfAruco = convertCVPointToMathPoint(cornersOfAruco.data32F.slice(4, 6));
    const topLeftCornerOfAruco = convertCVPointToMathPoint(cornersOfAruco.data32F.slice(0, 2));
    const orientation = drawAndGetDirectionOfAruco(frame, cornersOfAruco);

    // The center of the aruco
    const point = middleOfPoints(topLeftCornerOfAruco, bottomRightCornerOfAruco);

    return {
        position: point,
        orientation: orientation,
        id: arucoId
    }
}

/**
 * Detect and draws arucos in a given frame
 * @param frame the frame containing the arucos
 * @returns {cv.Point[]} list of cv.Points containing the center of each aruco
 */
export function detectAndDrawArucos(frame) {
    const dictionary = cv.getPredefinedDictionary(cv.DICT_ARUCO_ORIGINAL);
    let arucoIds = new cv.Mat();
    let arucoCorners = new cv.MatVector();

    let detectionParams = new cv.aruco_DetectorParameters();
    let refineParams = new cv.aruco_RefineParameters(10, 3, true);
    let detector = new cv.aruco_ArucoDetector(dictionary, detectionParams, refineParams)

    detector.detectMarkers(frame, arucoCorners, arucoIds);

    const robotsArucos = [];
    let topLeftAruco, topRightAruco, bottomLeftAruco, bottomRightAruco;

    for (let i = 0; i < arucoIds.rows; i++) {
        let arucoId = arucoIds.data32S[i];
        let cornersOfAruco = arucoCorners.get(i);

        // don't detect banned aruco ids
        if (!BANNED_ARUCOS.includes(arucoId)) {
            if (isSimulator) {
                robotsArucos.push(generateArucoData(frame, cornersOfAruco, arucoId));
            } else {
                const topLeftCornerOfAruco = cornersOfAruco.data32F.slice(0, 2);
                const x = topLeftCornerOfAruco[0];
                const y = topLeftCornerOfAruco[1];
                const point = new cv.Point(x, y);

                switch (arucoId) {
                    case TOP_LEFT_ARUCO_ID:
                        topLeftAruco = point;
                        break;
                    case TOP_RIGHT_ARUCO_ID:
                        topRightAruco = point;
                        break;
                    case BOTTOM_LEFT_ARUCO_ID:
                        bottomLeftAruco = point;
                        break;
                    case BOTTOM_RIGHT_ARUCO_ID:
                        bottomRightAruco = point
                        break;
                    default:
                        robotsArucos.push(generateArucoData(frame, cornersOfAruco, arucoId));
                }
            }
        }
    }

    let res;

    if (isSimulator) {
        res = robotsArucos;
        vue.drawDetectedArucos(res);
    } else {
        const tableCorners = [topLeftAruco, topRightAruco, bottomRightAruco, bottomLeftAruco];
        res = tableCorners.concat(robotsArucos);
        cv.drawDetectedMarkers(frame, arucoCorners, arucoIds);
    }
    return res;
}

export function detectCircles(frame, ballRadius = DEFAULT_BALL_RADIUS) {
    let circles = new cv.Mat();

    let margin = (20 / 100) * ballRadius; // + or - 20% of expected size
    let minRadius = ballRadius - margin;
    let maxRadius = ballRadius + margin;

    cv.HoughCircles(frame, circles, cv.HOUGH_GRADIENT,
        HOUGH_CIRCLES_RESOLUTION,
        HOUGH_CIRCLES_DISTANCE_BETWEEN_CIRCLES,
        HOUGH_CIRCLES_PARAMETER_1,
        HOUGH_CIRCLES_PARAMETER_2,
        minRadius,
        maxRadius
    );
    return circles;
}

export function drawDetectedCircles(frame, circles, mv, robots, tableCorners, isPerimeterFound = false) {
    ballsPositions = [];
    holesPositions = [];

    for (let i = 0; i < circles.cols; ++i) {
        let circle = circles.data32F.slice(i * 3, (i + 1) * 3);
        let circleCenter = new cv.Point(circle[0], circle[1]);
        let perimeterColor = [0, 0, 255, 255]; // color when no table is detected

        // Detect which ones are inside the table or not and add the inside one in the attribute
        if (isPerimeterFound) {
            let result = cv.pointPolygonTest(mv, circleCenter, true);

            // Change the color if inside or outside circle and differentiate balls from holes
            if (result >= 0) {
                // if the center of the detected circle is too close from the site of the table it may be a hole
                let ballRadius = circle[2];
                let isHole = false;

                const [topLeft, topRight, bottomRight, bottomLeft] = tableCorners;
                const topMiddleHole = middleOfPoints(topLeft, topRight);
                const bottomMiddleHole = middleOfPoints(bottomLeft, bottomRight);

                const tableHoles = tableCorners.slice();
                tableHoles.push(topMiddleHole, bottomMiddleHole);

                for (const corner of tableHoles) {
                    // If the circle is too close to a hole, it must be considered a hole too
                    if (distanceBetweenPoints(circleCenter, corner) < ballRadius * HOLE_DISTANCE_FACTOR) {
                        isHole = true;
                    }
                }

                if (isHole && (holesPositions.length < MAXIMUM_HOLES)) {
                    perimeterColor = [128, 128, 128, 255] // color of holes
                    holesPositions.push(circleCenter);
                } else {
                    let i = 0;
                    let isCircleOnAruco = false;

                    while (i < robots.length && !isCircleOnAruco) {
                        let robotPosition = robots[i].position;
                        let dist = distanceBetweenPoints(robotPosition, circleCenter);

                        // If the circle is too close to aruco
                        if (dist <= ballRadius * 3) {
                            isCircleOnAruco = true;
                        }
                        i++;
                    }
                    perimeterColor = isCircleOnAruco ? [255, 0, 0, 255] : [0, 255, 0, 255];
                    ballsPositions.push(circleCenter);
                }
            } else {
                perimeterColor = [255, 0, 0, 255] // color of balls outside the table (red)
            }
        }
        cv.circle(frame, circleCenter, circle[2], perimeterColor, 3);
        cv.circle(frame, circleCenter, 3, [255, 255, 0, 255], -1);
    }
}

export function getRealBalls() {
    return ballsPositions;
}

export function getRealHoles() {
    return holesPositions;
}
