// https://docs.opencv.org/3.4/df/def/tutorial_js_meanshift.html
var ready = false;
var streaming = false;
var video = "video not loaded.";

window.onload = (event) => {
    console.log("page is fully loaded");
    video = document.getElementById('videoInput');
};

function openCVReady(){
    cv['onRuntimeInitialized']=()=>{
        // do all your work here
        ready = true;
    }
}

function stream(){
    video = document.getElementById('videoInput');
    streaming = true;
    videoTrack();
}

function pauseVid() {
    streaming = false;
}

function videoTrack(){    
    if (ready && video!="video not loaded"){
        let cap = new cv.VideoCapture(video);
        let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        cap.read(frame);
        let src = frame;
        let dst = src.clone();
        let circles = new cv.Mat();

        frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        cap.read(frame);

        cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);

        // You can try more different parameters
        cv.HoughCircles(src, circles, cv.HOUGH_GRADIENT,
            1.75, 15, 72, 26, 12, 15);
        
        let y_1 = 75;
        let x_1 = 105;
        let y_3 = 390;
        let x_3 = 605;
        let y_4 = 75;
        let x_4 = 605;
        let y_2 = 390;
        let x_2 = 105;

        let p1 = new cv.Point(x_1, y_1);
        let p2 = new cv.Point(x_2, y_2); 
        let p3 = new cv.Point(x_3, y_3);
        let p4 = new cv.Point(x_4, y_4);

        cv.line(dst, p1, p2, [0, 255, 0, 255], 1);
        cv.line(dst, p2, p3, [0, 255, 0, 255], 1);
        cv.line(dst, p3, p4, [0, 255, 0, 255], 1);
        cv.line(dst, p4, p1, [0, 255, 0, 255], 1);
        cv.imshow('canvasOutput', dst);

        // take first frame of the video
        let nbCircles = 0;
        while(nbCircles<16){
            nbCircles = 0;
            frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
            cap.read(frame);
            src = frame;
            dst = src.clone();
            circles = new cv.Mat();

            cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);

            // You can try more different parameters
            cv.HoughCircles(src, circles, cv.HOUGH_GRADIENT,
                1.65, 10, 72, 26, 12, 15);
            // draw circles
            for (let i = 0; i < circles.cols; ++i) {
                let x = circles.data32F[i * 3]; 
                let y = circles.data32F[i * 3 + 1];

                if (x>x_1 && x<x_4 && y>y_1 && y<y_2){
                    console.log("Coordonnées = ("+x+","+y+");");
                    let radius = circles.data32F[i * 3 + 2];
                    let center = new cv.Point(x, y);

                    cv.circle(dst, center, radius, [0, 0, 0, 255], 3);
                    nbCircles++;
                }else{
                    nbCircles--;
                }
            }
        }
        cv.imshow('canvasOutput', dst);

        let listTrack = new Array();
        let listRoiHist = new Array();
        for(let i = 0 ; i < nbCircles ; i++){
            listTrack.push(new cv.Rect(circles.data32F[i * 3], circles.data32F[i * 3 + 1], 10, 10));

            // hardcode the initial location of window
            //let trackWindow = new cv.Rect(470, 230, 200, 200); //x, y, width, height

            // set up the ROI for tracking
            let roi = frame.roi(listTrack[i]);
            let hsvRoi = new cv.Mat();
            cv.cvtColor(roi, hsvRoi, cv.COLOR_RGBA2RGB);
            cv.cvtColor(hsvRoi, hsvRoi, cv.COLOR_RGB2HSV);
            let mask = new cv.Mat();
            let lowScalar = new cv.Scalar(30, 30, 0);
            let highScalar = new cv.Scalar(1000, 180, 180);
            let low = new cv.Mat(hsvRoi.rows, hsvRoi.cols, hsvRoi.type(), lowScalar);
            let high = new cv.Mat(hsvRoi.rows, hsvRoi.cols, hsvRoi.type(), highScalar);
            cv.inRange(hsvRoi, low, high, mask);
            let roiHist = new cv.Mat();
            let hsvRoiVec = new cv.MatVector();
            hsvRoiVec.push_back(hsvRoi);
            cv.calcHist(hsvRoiVec, [0], mask, roiHist, [180], [0, 180]);
            cv.normalize(roiHist, roiHist, 0, 255, cv.NORM_MINMAX);

            listRoiHist.push(roiHist);

            // delete useless mats.
            roi.delete(); hsvRoi.delete(); mask.delete(); low.delete(); high.delete(); hsvRoiVec.delete();
        }

        // Setup the termination criteria, either 10 iteration or move by at least 1 pt
        let termCrit = new cv.TermCriteria(cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT, 100, 1);

        let hsv = new cv.Mat(video.height, video.width, cv.CV_8UC3);
        let hsvVec = new cv.MatVector();
        hsvVec.push_back(hsv);
        let trackBox = null;

        const FPS = 30;
        function processVideo() {
            try {
                let begin = Date.now();

                // start processing.
                frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
                cap.read(frame);
                dst = src.clone();
                cv.cvtColor(frame, hsv, cv.COLOR_RGBA2RGB);
                cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

                for(let i = 0 ; i < nbCircles ; i++){
                    cv.calcBackProject(hsvVec, [0], listRoiHist[i], dst, [0, 180], 1);
                    // apply camshift to get the new location
                    [trackBox, trackWindow] = cv.CamShift(dst, listTrack[i], termCrit);
                    // Draw it on image
                    let pts = cv.rotatedRectPoints(trackBox);
                    //console.log(pts[0]+", "+pts[1]+", "+pts[2]+", "+pts[3]);
                    cv.line(frame, pts[0], pts[1], [255, 0, 0, 255], 3);
                    cv.line(frame, pts[1], pts[2], [255, 0, 0, 255], 3);
                    cv.line(frame, pts[2], pts[3], [255, 0, 0, 255], 3);
                    cv.line(frame, pts[3], pts[0], [255, 0, 0, 255], 3);
                    cv.imshow('canvasOutput', frame);
                }                

                // schedule the next one.
                let delay = 1000/FPS - (Date.now() - begin);
                setTimeout(processVideo, delay);
            } catch (err) {
                console.log(err);
            }
        
        };

        // schedule the first one.
        setTimeout(processVideo, 0);
    }
}