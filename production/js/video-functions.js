export const WIDTH = 700;
export const HEIGHT = 400;

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

    let angle = Math.atan2(bottomCenter.y - topCenter.y, topCenter.x - bottomCenter.x) / Math.PI;

    cv.line(frame, bottomCenter, topCenter, new cv.Scalar(0, 255, 0), 2);
    cv.rectangle(frame, topCenter, topCenter, new cv.Scalar(255, 0, 0), 15);

    return angle.toFixed(2);
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

    // Deduce the corners, and the size of the table
    let topLeftCornerOfArucos = [];

    for (let i = 0; i < ArucoIds.rows; i++) {
        let ArucoId = ArucoIds.data32S[i];
        let cornersOfAruco = ArucoCorners.get(i);

        // id 0 aruco can be detected too easily, it causes problems
        if (ArucoId !== 0) {
            let topLeftCornerOfAruco = cornersOfAruco.data32F.slice(0, 2);
            topLeftCornerOfArucos.push(topLeftCornerOfAruco);

            console.log(drawAndGetDirectionOfAruco(frame, cornersOfAruco) + "π");
        }
    }
    return sortCorners(topLeftCornerOfArucos);
}

export function detectCircles(frame, ballDiameter = 10) {
    let circles = new cv.Mat();

    let margin = (20 / 100) * ballDiameter; // + or - 20% of expected size
    let minDiameter = ballDiameter - margin;
    let maxDiameter = ballDiameter + margin;

    cv.HoughCircles(frame, circles, cv.HOUGH_GRADIENT,
        2,              // resolution : 1 = default resolution, 2 = resolution divided by 2
        15,             // distance between circles
        100,            // the lower it is, the more circles are detected (including false ones)
        30,             //
        minDiameter,    // minimum diameter of circles
        maxDiameter     // maximum diameter of circles
    );

    return circles;
}

export function drawDetectedCircles(frame, circles, mv, isPerimeterFound = false) {
    for (let i = 0; i < circles.cols; ++i) {
        let circle = circles.data32F.slice(i * 3, (i + 1) * 3);
        let center = new cv.Point(circle[0], circle[1]);
        let perimeterColor = [0, 0, 255, 255];

        // Detect which ones are inside the table or not
        if (isPerimeterFound) {
            let result = cv.pointPolygonTest(mv, center, false);

            // Change the color if inside or outside circle
            result >= 0 ? perimeterColor = [0, 255, 0, 255] : perimeterColor = [255, 0, 0, 255]
        }

        cv.circle(frame, center, circle[2], perimeterColor, 3);
        cv.circle(frame, center, 3, [255, 255, 0, 255], -1);
    }
}

export function sortCorners(corners) {
    let topLeft, topRight, bottomLeft, bottomRight;

    for (let i = 0; i < corners.length; i++) {
        let x = corners[i][0];
        let y = corners[i][1];

        const isTop = y > 0 && y < HEIGHT / 2;
        const isBottom = y > HEIGHT / 2 && y < HEIGHT;
        const isLeft = x > 0 && x < WIDTH / 2;
        const isRight = x > WIDTH / 2 && x < WIDTH;

        // Separate the table into 4 areas
        if (isTop && isLeft) {
            topLeft = new cv.Point(x, y);
        } else if (isTop && isRight) {
            topRight = new cv.Point(x, y);
        } else if (isBottom && isRight) {
            bottomRight = new cv.Point(x, y);
        } else if (isBottom && isLeft) {
            bottomLeft = new cv.Point(x, y);
        }
    }

    return [topLeft, topRight, bottomRight, bottomLeft];
}

export function distanceBetweenPoints(p1, p2) {
    return Math.sqrt(
        Math.pow(p1.x - p1.y, 2) + Math.pow(p2.x - p2.y, 2)
    );
}

export function calculateBallSize(tableLength) {
    let ballRealSize = 4.5;
    let tableRealSize = 118.5;

    return (tableLength * ballRealSize) / tableRealSize;
}