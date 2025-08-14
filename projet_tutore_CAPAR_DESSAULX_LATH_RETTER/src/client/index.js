import ioC from "socket.io-client";
import express from "express";
import http from "http";
import socket from "socket.io";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var app = express();
var server = http.createServer(app);
var io = socket.listen(server, {
    pingInterval: 30000,
    pingTimeout: 5000,
});
var socketC = ioC.connect("http://localhost:8001");

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/indexDC.html');
});

server.listen(8024);
app.use(express.static('public'));

io.on('connection', function (socket) {

    socket.emit('message', 'Vous êtes bien connecté !');
    
    console.log('Socket connected: ' + socket.conn.remoteAddress);

    socket.on('disconnect', function(socket) {
        console.log('Socket disconnected');
    });

    socket.on('mouvement', function(val) {
        console.log('mouvement'+val);
        socket.broadcast.emit('mouvement', val);
    });

    socket.on('temps', function(val) {
        console.log('temps'+val);
        socket.broadcast.emit('temps', val);
    });

    socket.on('videoHeightWidth', function(val) {
		console.log('videoHeightWidth'+val);
        socketC.emit('videoHeightWidth',val);
    });

    socket.on('positionRobot',function(val){
		console.log('positionRobot'+val);
        socketC.emit('positionRobot',val);
    });

    socket.on('selectedBall',function(val){
		console.log('selectedBall'+val);
        socketC.emit('selectedBall',val);
    });

    socket.on('positions',function(val){
		console.log('positions'+val);
        socketC.emit('positions',val);
    });

    socket.on('message', function(message) {
        console.log('message du client : '+message);
    });

});

function emitMSG(){
    socketC.on('message', function(message){
        console.log('message du serveur : '+message);
    });

    socketC.emit('message', 'Salut serveur, ça va ?');
}

emitMSG();

console.log("Server is running.");
