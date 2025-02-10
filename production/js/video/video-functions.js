import {
    BANNED_ARUCOS,
    BOTTOM_LEFT_ARUCO_ID,
    BOTTOM_RIGHT_ARUCO_ID,
    DEFAULT_BALL_RADIUS,
    DISTANCE_FROM_BORDER_TO_BE_HOLE,
    HOUGH_CIRCLES_DISTANCE_BETWEEN_CIRCLES,
    HOUGH_CIRCLES_PARAMETER_1,
    HOUGH_CIRCLES_PARAMETER_2,
    HOUGH_CIRCLES_RESOLUTION,
    TOP_LEFT_ARUCO_ID,
    TOP_RIGHT_ARUCO_ID
} from "./video-parameters.js";
import {distanceBetweenPoints} from "../brain/brain.js";

let ballsPositions = [];
let holesPositions = [];

export function preProcess(frame) {
    // let blurred = new cv.Mat();
    let gray = new cv.Mat();
    let bright = new cv.Mat();
    // let blurred = new cv.Mat();

    cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY); // Grayscale
    cv.convertScaleAbs(gray, bright, 1.5, 20); // 1 - 3 // 0 - 100
    // cv.bilateralFilter(bright, blurred, 9, 24, 60);

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
    let topLeftCornerOfAruco = cornersOfAruco.data32F.slice(0, 2);
    let topRightCornerOfAruco = cornersOfAruco.data32F.slice(2, 4);
    let bottomRightCornerOfAruco = cornersOfAruco.data32F.slice(4, 6);
    let bottomLeftCornerOfAruco = cornersOfAruco.data32F.slice(6, 8);

    let topCenter = new cv.Point(
        (topRightCornerOfAruco[0] + topLeftCornerOfAruco[0]) / 2,
        (topRightCornerOfAruco[1] + topLeftCornerOfAruco[1]) / 2
    );
    let bottomCenter = new cv.Point(
        (bottomLeftCornerOfAruco[0] + bottomRightCornerOfAruco[0]) / 2,
        (bottomLeftCornerOfAruco[1] + bottomRightCornerOfAruco[1]) / 2
    );

    let angle = Math.atan2(bottomCenter.y - topCenter.y, topCenter.x - bottomCenter.x) * (180 / Math.PI);
    angle < 0 ? angle += 360 : angle;

    cv.line(frame, bottomCenter, topCenter, new cv.Scalar(0, 255, 0), 2);
    cv.rectangle(frame, topCenter, topCenter, new cv.Scalar(255, 0, 0), 15);

    return angle;
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
    cv.drawDetectedMarkers(frame, arucoCorners, arucoIds);

    let robotsArucos = [];
    let topLeftAruco, topRightAruco, bottomLeftAruco, bottomRightAruco;

    for (let i = 0; i < arucoIds.rows; i++) {
        let arucoId = arucoIds.data32S[i];
        let cornersOfAruco = arucoCorners.get(i);

        // don't detect banned aruco ids
        if (!BANNED_ARUCOS.includes(arucoId)) {
            let topLeftCornerOfAruco = cornersOfAruco.data32F.slice(0, 2);
            let x = topLeftCornerOfAruco[0];
            let y = topLeftCornerOfAruco[1];

            let point = new cv.Point(x, y);

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
                    let bottomRightCornerOfAruco = cornersOfAruco.data32F.slice(4, 6);
                    let orientation = drawAndGetDirectionOfAruco(frame, cornersOfAruco);

                    // The center of the aruco
                    point = new cv.Point((topLeftCornerOfAruco[0] + bottomRightCornerOfAruco[0]) / 2,
                        (topLeftCornerOfAruco[1] + bottomRightCornerOfAruco[1]) / 2)

                    let robotData = {
                        position: point,
                        orientation: orientation,
                    }
                    robotsArucos.push(robotData);
            }
        }
    }
    let corners = [topLeftAruco, topRightAruco, bottomRightAruco, bottomLeftAruco];
    return corners.concat(robotsArucos);
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

export function drawDetectedCircles(frame, circles, mv, robots, isPerimeterFound = false) {
    ballsPositions = [];
    holesPositions = [];

    for (let i = 0; i < circles.cols; ++i) {
        let circle = circles.data32F.slice(i * 3, (i + 1) * 3);
        let center = new cv.Point(circle[0], circle[1]);
        let perimeterColor = [0, 0, 255, 255]; // color when no table is detected

        // Detect which ones are inside the table or not and add the inside one in the attribute
        if (isPerimeterFound) {
            let result = cv.pointPolygonTest(mv, center, true);

            // Change the color if inside or outside circle and differentiate balls from holes
            if (result >= 0) {
                // if the center of the detected circle is too close from the site of the table it may be a hole
                if (result < DISTANCE_FROM_BORDER_TO_BE_HOLE && holesPositions.length < 6) {
                    perimeterColor = [128, 128, 128, 255] // color of holes
                } else {
                    let i = 0;
                    let isOnAruco = false;

                    while (i < robots.length && !isOnAruco) {
                        let robotPosition = robots[i].position;
                        let dist = distanceBetweenPoints(robotPosition, center);

                        if (dist <= circle[2] * 3) {
                            isOnAruco = true;
                        }
                        i++;
                    }
                    perimeterColor = isOnAruco ? [255, 0, 0, 255] : [0, 255, 0, 255];
                    ballsPositions.push(center);
                }
            } else {
                perimeterColor = [255, 0, 0, 255] // color of balls outside the table (red)
            }
        }

        cv.circle(frame, center, circle[2], perimeterColor, 3);
        cv.circle(frame, center, 3, [255, 255, 0, 255], -1);
    }
}

export function getRealBalls() {
    return ballsPositions;
}

export function getRealHoles() {
    return holesPositions;
}
