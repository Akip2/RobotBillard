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
    res.sendFile(__dirname + '/index.html');
});

server.listen(8001);
app.use(express.static('public'));

io.sockets.on('connection', function (socket) {

    console.log('Socket connected: ' + socket.conn.remoteAddress);

    socket.on('curseur', function(val) {
        console.log('curseur'+val);
        //socket.emit('okcurseur', val);
        socket.broadcast.emit('okcurseur', val);
    });

    socket.on('event_name', function(socket) {
        console.log("Event reçu");
    });

    socket.on('disconnect', function(socket) {
        console.log('Socket disconnected');
    });

    socket.on("bouton", function (val) {
        console.log("Bouton")
        socket.broadcast.emit('bouton', val);
    })
});

console.log("Server is running.");