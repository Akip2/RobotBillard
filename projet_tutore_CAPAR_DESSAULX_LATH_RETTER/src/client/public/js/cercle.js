// https://docs.opencv.org/3.4/df/def/tutorial_js_meanshift.html
var ready = false;
var streaming = false;
var image = "image not loaded";


window.onload = (event) => {
    console.log("page is fully loaded");
    image = document.getElementById('img');
};


function openCVReady(){
    cv['onRuntimeInitialized']=()=>{
        // do all your work here
        ready = true;
    }
}

function circleCapture(){
    if (ready && image!="image not loaded"){
        let src = cv.imread('img');
        let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8U);
        let circles = new cv.Mat();
        let color = new cv.Scalar(255, 0, 0);
        cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);

        // You can try more different parameters
        cv.HoughCircles(src, circles, cv.HOUGH_GRADIENT,
                    2, 50, 100, 40, 25, 30);
        // draw circles
        for (let i = 0; i < circles.cols; ++i) {
            let x = circles.data32F[i * 3];
            let y = circles.data32F[i * 3 + 1];
            let radius = circles.data32F[i * 3 + 2];
            let center = new cv.Point(x, y);
            cv.circle(dst, center, radius, color);
        }
        cv.imshow('canvasOutput', dst);
    }
}

function circleCaptureOnImage(){
    if (ready && image!="image not loaded"){
        let src = cv.imread('img');
        let dst = src.clone();
        let circles = new cv.Mat();

        cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);

        // You can try more different parameters
        cv.HoughCircles(src, circles, cv.HOUGH_GRADIENT,
                    2, 50, 100, 40, 25, 30);
        // draw circles
        for (let i = 0; i < circles.cols; ++i) {
            let x = circles.data32F[i * 3];
            let y = circles.data32F[i * 3 + 1];
            let radius = circles.data32F[i * 3 + 2];
            let center = new cv.Point(x, y);

            cv.circle(dst, center, radius, [0, 0, 0, 255], 3);
        }
        cv.imshow('canvasOutput', dst);

        src.delete();
        dst.delete();
        circles.delete();
    }
}