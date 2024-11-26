function main() {
    document.getElementById("status").innerHTML = "OpenCV.js is ready.";

    let src = cv.imread("imageSrc");

    // let dst = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8U);
    let dst = src;
    let circles = new cv.Mat();
    let color = new cv.Scalar(255, 0, 0);
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);

    // boules.jpg
    cv.HoughCircles(src, circles, cv.HOUGH_GRADIENT,
        2, 10, 75, 40, 15, 20);

    // draw circles
    for (let i = 0; i < circles.cols; ++i) {
        let x = circles.data32F[i * 3];
        let y = circles.data32F[i * 3 + 1];
        let radius = circles.data32F[i * 3 + 2];
        let center = new cv.Point(x, y);
        cv.circle(dst, center, radius, color);

        // Draw the circle's center
        cv.circle(dst, center, 3, color);
    }
    cv.imshow('canvasOutput', dst);
    src.delete();
    dst.delete();
    circles.delete();
}

const Module = {
    onRuntimeInitialized() {
        main();
    }
}

// export default {
//     main: main
// }