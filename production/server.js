const path=require("path");
const express = require('express');
const app = express();
const server = require('http').createServer(app);

const io = require('socket.io').listen(server, {
    pingInterval: 30000,
    pingTimeout: 5000,
});

const port = 8001;

// - Utilisé pour gérer des problèmes de répertoire -----------------
app.use(express.static(path.join(__dirname)));

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

// - Affichage en continu des sockets qui passent -------------------
server.listen(port);

// Lorsqu'un ordre est envoyé au robot depuis le navigateur,
// il passe par le serveur, puis est envoyé au(x) robot(s)
io.sockets.on("connection", function (socket) {
    console.log("Socket connected: " + socket.conn.remoteAddress);

    socket.on("motor", function(val) {
        console.log("motor" + JSON.stringify(val));
        socket.broadcast.emit("motor", val);
    });

    socket.on("disconnect", function() {
        console.log("Socket disconnected");
    });
});

console.log(`Server is running on port ${port}`);
