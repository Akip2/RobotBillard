function main() {
    let src = cv.imread("imageSrc");

    let markerImage = new cv.Mat();
    let dictionary = cv.getPredefinedDictionary(cv.DICT_ARUCO_ORIGINAL);
    // let dictionary = cv.getPredefinedDictionary(cv.DICT_5X5_250);

    cv.cvtColor(src, markerImage, cv.COLOR_RGBA2GRAY);

    // Détecter les marqueurs ArUco
    let markerCorners = new cv.MatVector();
    let markerIds = new cv.Mat();

    let detectionParams = new cv.aruco_DetectorParameters();
    let refineParams = new cv.aruco_RefineParameters(10,3,true);
    let detector = new cv.aruco_ArucoDetector(dictionary, detectionParams, refineParams)

    detector.detectMarkers(src, markerCorners, markerIds);

    // Dessiner les marqueurs détectés
    // if (detector.rows > 0) {
        cv.drawDetectedMarkers(markerImage, markerCorners, markerIds);
    // }

    cv.imshow('canvasOutput', markerImage);
    src.delete();
    // dst.delete();

    detectionParams.delete();
    refineParams.delete();
    dictionary.delete();
    detector.delete();
}

const Module = {
    onRuntimeInitialized() {
        main();
    }
}