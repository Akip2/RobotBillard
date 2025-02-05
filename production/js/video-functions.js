export const WIDTH = 700;
export const HEIGHT = 400;

//ids of the aruco placed at the corners of the table
const topLeftId = 757;
const topRightId = 1;
const bottomLeftId = 157;
const bottomRightId = 10;

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

export function drawAndGetDirectionOfAruco(frame, cornersOfAruco) {
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

    if (angle < 0) {
        angle += 360;
    }

    cv.line(frame, bottomCenter, topCenter, new cv.Scalar(0, 255, 0), 2);
    cv.rectangle(frame, topCenter, topCenter, new cv.Scalar(255, 0, 0), 15);

    return angle;
}

export function detectAndDrawArucos(frame) {
    let ArucoCorners = new cv.MatVector();
    let ArucoIds = new cv.Mat();

    const dictionary = cv.getPredefinedDictionary(cv.DICT_ARUCO_ORIGINAL);
    let detectionParams = new cv.aruco_DetectorParameters();
    let refineParams = new cv.aruco_RefineParameters(10, 3, true);
    let detector = new cv.aruco_ArucoDetector(dictionary, detectionParams, refineParams)

    detector.detectMarkers(frame, ArucoCorners, ArucoIds);
    cv.drawDetectedMarkers(frame, ArucoCorners, ArucoIds);

    let robotsArucos = [];
    let topLeft, topRight, bottomLeft, bottomRight;

    for (let i = 0; i < ArucoIds.rows; i++) {
        let ArucoId = ArucoIds.data32S[i];
        let cornersOfAruco = ArucoCorners.get(i);

        // id 0 aruco can be detected too easily, causes problems
        if (ArucoId !== 0) {
            let topLeftCornerOfAruco = cornersOfAruco.data32F.slice(0, 2);
            let x = topLeftCornerOfAruco[0];
            let y = topLeftCornerOfAruco[1];

            let point = new cv.Point(x, y);

            switch (ArucoId) {
                case topLeftId:
                    topLeft = point;
                    break;
                case topRightId:
                    topRight = point;
                    break;
                case bottomLeftId:
                    bottomLeft = point;
                    break;
                case bottomRightId:
                    bottomRight = point
                    break;
                default:
                    let orientation = drawAndGetDirectionOfAruco(frame, cornersOfAruco);
                    let robotData = {
                        position: point,
                        orientation: orientation,
                    }

                    robotsArucos.push(robotData);
            }
        }
    }

    let corners = [topLeft, topRight, bottomRight, bottomLeft];
    return corners.concat(robotsArucos);
}

export function detectCircles(frame, ballRadius = 10) {
    let circles = new cv.Mat();

    let margin = (20 / 100) * ballRadius; // + or - 20% of expected size
    let minRadius = ballRadius - margin;
    let maxRadius = ballRadius + margin;

    cv.HoughCircles(frame, circles, cv.HOUGH_GRADIENT,
        2,              // resolution : 1 = default resolution, 2 = resolution divided by 2
        15,             // distance between circles
        100,            // the lower it is, the more circles are detected (including false ones)
        30,             //
        minRadius,    // minimum diameter of circles
        maxRadius     // maximum diameter of circles
    );

    return circles;
}

export function drawDetectedCircles(frame, circles, mv, isPerimeterFound = false) {

    ballsPositions = [];
    holesPositions = [];

    for (let i = 0; i < circles.cols; ++i) {
        let circle = circles.data32F.slice(i * 3, (i + 1) * 3);
        let center = new cv.Point(circle[0], circle[1]);
        let perimeterColor = [0, 0, 255, 255]; // color when no table is detected

        // Detect which ones are inside the table or not and add the inside one in the atribute
        if (isPerimeterFound) {
            let result = cv.pointPolygonTest(mv, center, true);

            // Change the color if inside or outside circle and differentiate balls from holes
            if (result >= 0) {
                // if the center of the detected circle is too close from the site of the table it may be a hole
                if (result < 38 && holesPositions.length < 6) {
                    perimeterColor = [128, 128, 128, 255] // color of holes
                } else {
                    perimeterColor = [0, 255, 0, 255] // color of balls inside the table (green)
                    ballsPositions.push(center);
                }
            } else {
                perimeterColor = [255, 0, 0, 255] // color of balls outsite the table (red)
            }
        }

        cv.circle(frame, center, circle[2], perimeterColor, 3);
        cv.circle(frame, center, 3, [255, 255, 0, 255], -1);
    }
}

export function getBallsPositions() {
    return ballsPositions;
}

export function getHolesPositions() {
    return holesPositions;
}