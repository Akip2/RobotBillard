const path = require("path");
const express = require('express');
const app = express();
const server = require('http').createServer(app);


const robotSockets = [];
let simulatorMode = false;

const io = require('socket.io').listen(server, {
    pingInterval: 30000,
    pingTimeout: 5000,
});

const port = 8001;

// -- Used to solve some problems ----------------
app.use(express.static(path.join(__dirname)));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

// Display the sockets coming to the server, which are then sent to the robot
server.listen(port);

io.sockets.on("connection", function (socket) {
    console.log("Socket connected: " + socket.conn.remoteAddress);

    robotSockets.push(socket); // We assume the connecting socket is a robot

    socket.on("motor", function (val) {
        console.log("motor" + JSON.stringify(val));

        if (simulatorMode) {
            socket.emit("motor", val); // We send the request back to the simulator
        } else {
            robotSockets.forEach(robotSocket => {
                robotSocket.emit("motor", val); // We send the request to each robot
            })
        }
    });

    socket.on("is-interface", function () { // We learn that the socket is the interface
        robotSockets.splice(robotSockets.indexOf(socket), 1);
    });

    socket.on("change-mode", function (val) { // User is changing the mode of the interface (simulator, manual, camera...)
        simulatorMode = (val === "simulator");
    });

    socket.on("disconnect", function () {
        if (robotSockets.includes(socket)) { // The disconnecting socket is a robot
            robotSockets.splice(robotSockets.indexOf(socket), 1);
        }

        console.log("Socket disconnected");
    });
});

console.log(`Server is running on localhost:${port}`);
