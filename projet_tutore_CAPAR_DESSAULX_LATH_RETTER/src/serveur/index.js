import express from "express";
import http from "http";
import socket from "socket.io";
import path from 'path';
import { fileURLToPath } from 'url';
import { setPositionsRobot, setPositionsBoules, setTrous, start } from "./main.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var app = express();
var server = http.createServer(app);
var io = socket.listen(server, {
    pingInterval: 30000,
    pingTimeout: 5000,
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(8001);
app.use(express.static('public'));

io.on('connection', function (socket) {

    socket.emit('message', 'Vous êtes bien connecté !');
    console.log('Socket connected: ' + socket.conn.remoteAddress);

    socket.on('disconnect', function(socket) {
        console.log('Socket disconnected');
    });

    socket.on('mouvement', function(val) {
        console.log('mouvement : '+val);
        socket.broadcast.emit('mouvement', val);
    });

    socket.on('temps', function(val) {
        console.log('temps'+val);
        socket.broadcast.emit('temps', val);
    });

    socket.on('videoWidthHeight',function(val){
        let message = val.split(" ");
        let videoWidth = message[0];
        let videoHeight = message[1];
        setVideoSize(videoWidth, videoHeight);
    });

    socket.on('positionRobot',function(val){
        let message = val.split(" ");
        let rX = message[0];
        let rY = message[1];
        let rD = message[2];

        setPositionsRobot(rX,rY,rD);
    });

    socket.on('selectedBall',function(val) {
        let message = val.split(" ");
        let bX = message[0];
        let bY = message[1];
        let trous = message[2];
        setPositionsBoules(bX,bY);
        setTrous(trous);
        start();
    });

    socket.on('message', function(message) {
        console.log('message du client:'+message);
    });

});

console.log("Server is running.");
