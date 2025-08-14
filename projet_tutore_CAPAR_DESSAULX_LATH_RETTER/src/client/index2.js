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

    socket.on('robotXYD', function(val) {
        let message = val.split(" ");
        let x = message[0];
        let y = message[1];
        let d = message[2];
        console.log("AHHH BAH degrès : ")
        console.log(d);
        socketC.emit('recupererXYDRobot', val);
    });

    socket.on('bouleXY', function(val) {
        let message = val.split(" ");
        console.log("MMM bizarre "+val);
        socketC.emit('recupererXYBoule', val);
    });

    socket.on('videoHeightWidth', function(val) {
        socketC.emit('videoHeightWidth',val);
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
