//https://docs.opencv.org/3.4/df/def/tutorial_js_meanshift.html
//https://docs.opencv.org/3.4/d3/de5/tutorial_js_houghcircles.html 

var xB=-1, yB=-1;
var video = "video not loaded.";

let circles_array = [];


export function isReady(videoElem) {
    video = videoElem;
    videoDetectCircles();
}

function videoDetectCircles(){
    if (video!="video not loaded."){
        let cap = new cv.VideoCapture(video);

        // take first frame of the video
        let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
        const FPS = 30;
        function processVideo(){
            try {
                let begin = Date.now();

                 // start processing.
                frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
                cap.read(frame);
                let src = frame;
                let dst = src.clone();
                let circles = new cv.Mat();
        
                cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);

                // You can try more different parameters
                cv.HoughCircles(src, circles, cv.HOUGH_GRADIENT,
                    1.71, 15, 50, 29, 15, 18);
                    //1.75, 15, 72, 26, 15, 18);
                // draw circles
                
                let y_1 = 30;
                let x_1 = 53;
                let y_3 = 348;
                let x_3 = 698;
                let y_4 = 35; //let y_4 = 35;
                let x_4 = 700; //let x_4 = 700;
                let y_2 = 350;
                let x_2 = 53;

                let p1 = new cv.Point(x_1, y_1);
                let p2 = new cv.Point(x_2, y_2); 
                let p3 = new cv.Point(x_3, y_3);
                let p4 = new cv.Point(x_4, y_4);

                cv.line(dst, p1, p2, [0, 255, 0, 255], 1);
                cv.line(dst, p2, p3, [0, 255, 0, 255], 1);
                cv.line(dst, p3, p4, [0, 255, 0, 255], 1);
                cv.line(dst, p4, p1, [0, 255, 0, 255], 1);
                cv.imshow('canvasOutput', dst);

                let array_position = [];
                /*if (circles.cols==0){
                    xB = -1;
                    yB = -1;
                }*/
                circles_array = [];
                for (let i = 0; i < circles.cols; ++i) {
                    let x = circles.data32F[i * 3];
                    let y = circles.data32F[i * 3 + 1];

                    /*
                    // Average of RGBA of a square for each balls we have
                    let listR = new Array();let listG = new Array();let listB = new Array();let listA = new Array();
                    //let R = 0;let G = 0;let B = 0;let A = 0;
                    for(let j = y-10 ; j < y+10 ; j++){
                        for(let k = x -10 ; k < x + 10 ; k++){
                            let row = 1, col = 3;
                            if (src.isContinuous()) {
                                let R = src.data[row * src.cols * src.channels() + col * src.channels()];
                                let G = src.data[row * src.cols * src.channels() + col * src.channels() + 1];
                                let B = src.data[row * src.cols * src.channels() + col * src.channels() + 2];
                                let A = src.data[row * src.cols * src.channels() + col * src.channels() + 3];
                                console.log(R);
                                listR.push(R);listG.push(G);listB.push(B);listA.push(A);
                            }
                        }
                    }*/
                    //console.log(R);

                    //averageRGBA(listR,listG,listB,listA);

                    
                    //let robot = getCorners();
                    if (x>x_1 && x<x_4 && y>y_1 && y<y_2){
                        let radius = circles.data32F[i * 3 + 2];
                        let center = new cv.Point(x, y);
                        
                        //console.log("x : "+x+" y : "+y);
                        xB = x;
                        yB = y;

                        array_position.push({x: x, y: y});
                        circles_array.push({x: x, y: y, radius: radius});
                        cv.circle(dst, center, radius, [0, 0, 0, 255], 3);
                        cv.imshow('canvasOutput', dst);
                    }
                }

                //affichage dans html

                let div = document.getElementById("positionCercle");
                div.innerHTML = "";
                let str = "<table><tr><th>id</th><th>x</th><th>y</th></tr>";
                for(let i = 0 ; i < array_position.length ; i++){
                    str += "<tr><td>"+i+"</td><td>"+array_position[i].x+"</td><td>"+array_position[i].y+"</td></tr>";
                }
                div.innerHTML = str;

                cv.imshow('canvasOutput', dst);
                
                src.delete();
                dst.delete();
                circles.delete();

                // schedule the next one.
                let delay = 1000/FPS - (Date.now() - begin);
                setTimeout(processVideo,delay);
            } catch (err) {
                console.log(err);
            }
        
        };

        // schedule the first one.
        setTimeout(processVideo, 0);
    }
}

export function getXYBouleTarget(){
    return xB+" "+yB;
}

function averageRGBA(lR, lG, lB, lA){
    console.log(lR);
    let r, g, b, a;
    let length = lR.length;
    for(let i = 0; i < length ; i++){
        r += lR[i];
        g += lG[i];
        b += lB[i];
        a += lA[i];
    }
    r = r/length;
    g = g/length;
    b = b/length;
    a = a/length;

    console.log("RGBA("+r+", "+g+", "+b+", "+a+");");
}

export {circles_array}