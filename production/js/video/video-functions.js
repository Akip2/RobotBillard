import {
    bannedArucos,
    bottomLeftId,
    bottomRightId,
    defaultBallRadius,
    distanceFromBorder,
    houghCirclesDistanceBetweenCircles,
    houghCirclesParameter1,
    houghCirclesParameter2,
    houghCirclesResolution,
    topLeftId,
    topRightId
} from "./video-parameters.js";
import {distanceBetweenPoints} from "../brain.js";

let ballsPositions = [];
let holesPositions = [];

export function preProcess(frame) {
    // let blurred = new cv.Mat();
    let gray = new cv.Mat();

    cv.cvtColor(frame, gray, cv.COLOR_RGBA2GRAY); // Grayscale
    // cv.GaussianBlur(gray, blurred, new cv.Size(21, 21), 0);
    // cv.medianBlur(gray, blurred, parseFloat(document.getElementById("tmp-1").value));
    // cv.bilateralFilter(gray, blurred, 9, parseFloat(document.getElementById("tmp-1").value), parseFloat(document.getElementById("tmp-2").value));

    return gray;
}

/**
 * Only draws the direction in which the arucos are facing,
 * doesn't draw the actual arucos themselves
 * @param frame the frame which contains aruco
 * @param cornersOfAruco the 4 corners of an aruco that have already been detected
 * @returns {number} the angle (0 - 360) the aruco provided is facing
 */
export function drawAndGetDirectionOfArucos(frame, cornersOfAruco) {
    let topLeftCornerOfAruco = cornersOfAruco.data32F.slice(0, 2);
    let topRightCornerOfAruco = cornersOfAruco.data32F.slice(2, 4);
    let bottomLeftCornerOfAruco = cornersOfAruco.data32F.slice(4, 6);
    let bottomRightCornerOfAruco = cornersOfAruco.data32F.slice(6, 8);

    let topCenter = new cv.Point(
        (topRightCornerOfAruco[0] + topLeftCornerOfAruco[0]) / 2,
        (topRightCornerOfAruco[1] + topLeftCornerOfAruco[1]) / 2
    );
    let bottomCenter = new cv.Point(
        (bottomRightCornerOfAruco[0] + bottomLeftCornerOfAruco[0]) / 2,
        (bottomRightCornerOfAruco[1] + bottomLeftCornerOfAruco[1]) / 2
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

    let ArucoIds = new cv.Mat();
    let ArucoCorners = new cv.MatVector();

    let detectionParams = new cv.aruco_DetectorParameters();
    let refineParams = new cv.aruco_RefineParameters(10, 3, true);
    let detector = new cv.aruco_ArucoDetector(dictionary, detectionParams, refineParams)

    detector.detectMarkers(frame, ArucoCorners, ArucoIds);
    cv.drawDetectedMarkers(frame, ArucoCorners, ArucoIds);

    let robotsArucos = [];
    let topLeftAruco, topRightAruco, bottomLeftAruco, bottomRightAruco;

    for (let i = 0; i < ArucoIds.rows; i++) {
        let ArucoId = ArucoIds.data32S[i];
        let cornersOfAruco = ArucoCorners.get(i);

        // don't detect banned aruco ids
        if (bannedArucos.includes(ArucoId)) {
            let topLeftCornerOfAruco = cornersOfAruco.data32F.slice(0, 2);
            let x = topLeftCornerOfAruco[0];
            let y = topLeftCornerOfAruco[1];

            let point = new cv.Point(x, y);

            switch (ArucoId) {
                case topLeftId:
                    topLeftAruco = point;
                    break;
                case topRightId:
                    topRightAruco = point;
                    break;
                case bottomLeftId:
                    bottomLeftAruco = point;
                    break;
                case bottomRightId:
                    bottomRightAruco = point
                    break;
                default:
                    let orientation = drawAndGetDirectionOfArucos(frame, cornersOfAruco);
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

export function detectCircles(frame, ballRadius = defaultBallRadius) {
    let circles = new cv.Mat();

    let margin = (20 / 100) * ballRadius; // + or - 20% of expected size
    let minRadius = ballRadius - margin;
    let maxRadius = ballRadius + margin;

    cv.HoughCircles(frame, circles, cv.HOUGH_GRADIENT,
        houghCirclesResolution,
        houghCirclesDistanceBetweenCircles,
        houghCirclesParameter1,
        houghCirclesParameter2,
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
                if (result < distanceFromBorder && holesPositions.length < 6) {
                    perimeterColor = [128, 128, 128, 255] // color of holes
                } else {
                    let i = 0;
                    let isOnAruco = false;

                    while (i < robots.length && !isOnAruco) {
                        let robotPosition = robots[i].position;
                        let dist = distanceBetweenPoints(robotPosition, center);

                        if (dist <= circle[2] * 5) {
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

export function getHolesPositions() {
    return holesPositions;
}
