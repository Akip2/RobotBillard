var video, canvas, context, imageData, detector
let d = -1;
let x = -1;
let y = -1;
let cornerDR = -1, cornerDL = -1, cornerUL = -1, cornerUR = -1;

let arucos = [];

export function onLoad() {
    video = document.getElementById("video");
    canvas = document.getElementById("canvasOutput");
    context = canvas.getContext("2d", { willReadFrequently: true });

    canvas.width = parseInt(canvas.style.width);
    canvas.height = parseInt(canvas.style.height);

    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }

            return new Promise(function (resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
    }

    navigator.mediaDevices
        .getUserMedia({video: true})
        .then(function (stream) {
            //if ("srcObject" in video) {
                video.srcObject = stream;
                video.play();
                /*
            } else {
                video.src = window.URL.createObjectURL(stream);
            }*/
        })
        .catch(function (err) {
                console.log(err.name + ": " + err.message);
            }
        );

    detector = new AR.Detector();

    requestAnimationFrame(tick);
}

function tick() {
    requestAnimationFrame(tick);
    if (canvas.width!=0){
        snapshot();

        var markers = detector.detect(imageData);
        if (markers.length==0){
            x = -1;
            y = -1;
            d = -1;
        }
        drawCorners(markers);
        drawMiddle(markers);
        drawDirection(markers);
        drawId(markers);
        drawOrientation(markers)
        //console.log(markers)
        arucos = markers;
    }

}

function snapshot() {

    //context.drawImage(video, 0, 0, canvas.width, canvas.height);
   // imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    //create imagedata from video

    var canvas_copy = document.createElement("canvas");
    canvas_copy.width = canvas.width;
    canvas_copy.height = canvas.height;
    var ctx = canvas_copy.getContext("2d");

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
   }

function drawCorners(markers) {
    var corners, corner, i, j;

    context.lineWidth = 3;

    for (i = 0; i !== markers.length; ++i) {
        corners = markers[i].corners;

        context.strokeStyle = "red";
        context.beginPath();

        for (j = 0; j !== corners.length; ++j) {
            corner = corners[j];
            context.moveTo(corner.x, corner.y);
            corner = corners[(j + 1) % corners.length];
            context.lineTo(corner.x, corner.y);
        }

        context.stroke();
        context.closePath();

        context.strokeStyle = "green";
        context.strokeRect(corners[0].x - 2, corners[0].y - 2, 4, 4);
    }
}

function drawDirection(markers) {
    var corners, corner, i, j;

    context.lineWidth = 3;

    for (i = 0; i !== markers.length; ++i) {
        corners = markers[i].corners;

        context.strokeStyle = "red";
        context.beginPath();

        for (j = 0; j !== corners.length; ++j) {
            corner = corners[j];
            let x_middle = (corners[0].x + corners[2].x) / 2
            let y_middle = (corners[1].y + corners[3].y) / 2
            context.moveTo(x_middle, y_middle);
            // direction
            let x_direction = (corners[0].x + corners[1].x) / 2
            let y_direction = (corners[0].y + corners[1].y) / 2
            context.lineTo(x_direction, y_direction);
        }

        context.stroke();
        context.closePath();
    }
}

function drawMiddle(markers) {
    var corners, corner, i, j;

    context.lineWidth = 3;
    let str = "<table><tr><th>id</th><th>X</th><th>Y</th></tr>";

    for (i = 0; i !== markers.length; ++i) {
        corners = markers[i].corners;

        let x_middle = (corners[0].x + corners[2].x) / 2
        let y_middle = (corners[1].y + corners[3].y) / 2
        context.fillRect(x_middle, y_middle, 4, 4)
        context.strokeRect(x_middle, y_middle, 4, 4);

        //afficher position
        str += "<tr><td>" + markers[i].id + "</td><td>" + x_middle + "</td><td>" + y_middle + "</td></tr>";
    }
    document.getElementById("position").innerHTML = str;
}

function drawId(markers) {
    var corners, corner, x, y, i, j;

    context.strokeStyle = "blue";
    context.lineWidth = 1;

    for (i = 0; i !== markers.length; ++i) {
        corners = markers[i].corners;

        x = Infinity;
        y = Infinity;

        for (j = 0; j !== corners.length; ++j) {
            corner = corners[j];

            x = Math.min(x, corner.x);
            y = Math.min(y, corner.y);
        }

        context.strokeText(markers[i].id, x, y)
    }
}

function drawOrientation(markers) {
    var corners, corner, i, j;
    for (i = 0; i !== markers.length; ++i) {
        corners = markers[i].corners;
        // get middle of marker
        let x_middle = (corners[0].x + corners[2].x) / 2
        let y_middle = (corners[1].y + corners[3].y) / 2

        // direction
        let x_direction = (corners[0].x + corners[1].x) / 2
        let y_direction = (corners[0].y + corners[1].y) / 2

        var vector = {x: x_direction - x_middle, y: y_direction - y_middle}

        // theta
        var theta =(Math.atan2(vector.y, vector.x) * 180 / Math.PI);
        if (theta < 0) {
            theta += 360;
        }

        if (x_middle!=NaN && y_middle !=NaN && theta!=NaN){
            x = x_middle;
            y = y_middle;
            d = theta;
        }
    
        context.strokeText(theta, x_middle, y_middle + 20)

        // draw angle theta
        context.beginPath();
        context.arc(x_middle, y_middle, 10, 0, theta * Math.PI / 180);
        context.stroke();

    }
}

export function getCorners(){
    return new Array(cornerDR, cornerDL, cornerUL, cornerUR);
}

export function getXYD(){
    return x+" "+y+" "+d;
}

export {arucos};

