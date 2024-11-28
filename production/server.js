const path=require("path");
const express = require('express');
const app = express();
const server = require('http').createServer(app);
//io = require('socket.io').listen(server, {

const io = require('socket.io').listen(server, {
    //path: '/test',
    //serveClient: false,
    // below are engine.IO options
    pingInterval: 30000,
    pingTimeout: 5000,
    //cookie: false
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index_prototype.html');
});

server.listen(8001);

app.use(express.static(path.join(__dirname)));

io.sockets.on('connection', function (socket) {
    console.log('Socket connected: ' + socket.conn.remoteAddress);

    socket.on('motor', function(val) {
        console.log('motor'+JSON.stringify(val));
        socket.broadcast.emit('motor', val);
    });

    socket.on('disconnect', function() {
        console.log('Socket disconnected');
    });
});




console.log("Server is running.");



