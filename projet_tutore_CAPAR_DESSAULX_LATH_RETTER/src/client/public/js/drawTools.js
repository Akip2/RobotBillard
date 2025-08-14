let trianglePoints = [];
const drawTriangleOnCanvas = (ctx,position1, position2, position3) => {
    ctx.beginPath();
    ctx.moveTo(position1.x, position1.y);
    ctx.lineTo(position2.x, position2.y);
    ctx.lineTo(position3.x, position3.y);
    ctx.lineTo(position1.x, position1.y);
    ctx.strokeStyle = "red";
    ctx.stroke();
    ctx.closePath();

}

const drawTriangle = (position1,position2,position3) => {
    trianglePoints.push(position1, position2, position3);

}

function tick(){
    if (trianglePoints.length === 3 ){
        let canvas = document.getElementById("canvasOutput");
        let ctx = canvas.getContext("2d");
        drawTriangleOnCanvas(ctx, trianglePoints[0], trianglePoints[1], trianglePoints[2]);
    }
    requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

export {drawTriangle}
