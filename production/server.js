var path=require("path");
var express = require('express');
var app = express();
var server = require('http').createServer(app);
//io = require('socket.io').listen(server, {
var io = require('socket.io').listen(server, {
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

    socket.on('disconnect', function(socket) {
        console.log('Socket disconnected');
    });
});




console.log("Server is running.");



