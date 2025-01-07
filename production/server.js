const path = require("path");
const express = require('express');
const app = express();
const server = require('http').createServer(app);


const robotSockets = [];
const socketIds = [];
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

let lastDelay;

io.sockets.on("connection", function (socket) {
    console.log("Socket connected: " + socket.conn.remoteAddress);
    socket.emit("ask-identity");

    if (!socketIds.includes(socket.id)) {
        robotSockets.push(socket); // We assume the connecting socket is a robot
        socketIds.push(socket.id);
    }

    socket.on('event_name', function (val) {
        console.log(Math.abs((performance.now() - val["now"]) - lastDelay) + ' ms');
        lastDelay = performance.now() - val["now"];
    });

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

    socket.on("is-interface", function (mode) { // We learn that the socket is the interface
        robotSockets.splice(robotSockets.indexOf(socket), 1);
        simulatorMode = (mode === "simulator");
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

    socket.on("get-robots", function () {
        console.log("serveur : get-robots");
        const robots = robotSockets.map(robotSocket => ({
            name: `Robot ${robotSocket.id.substring(0, 5)}`
        }));
        socket.emit("robots-list", robots);
    });
});

console.log(`Server is running on localhost:${port}`);
