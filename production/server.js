const path = require("path");
const express = require('express');
const app = express();
const server = require('http').createServer(app);


const robotSockets = [];
const socketIps = [];
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
    socket.emit("ask-identity");

    console.log(socket.handshake.address);

    if (!socketIps.includes(socket.handshake.address)) {
        robotSockets.push(socket); // We assume the connecting socket is a robot
        socketIps.push(socket.handshake.address);
    } else { //Socket with this ip already exists, we replace it with the new one
        let index = socketIps.indexOf(socket.handshake.address);
        robotSockets[index] = socket
        console.log("Socket replaced: " + socket.handshake.address);
    }

    socket.on("motor", function (val) {
        console.log("motor" + JSON.stringify(val));

        let ipRobot = val.ipRobot;

        if (ipRobot === -1) {
            socket.broadcast.emit("motor", val);
        }

        if (simulatorMode) {
            socket.emit("motor", val); // We send the request back to the simulator
        } else {
            delete val.ipRobot;

            let i = 0;
            let found = false;
            let robotSocket;

            while (i < robotSockets.length && !found) {
                robotSocket = robotSockets[i];
                if (robotSocket.handshake.address === ipRobot) {
                    found = true;
                }
                i++;
            }

            if (found) {
                robotSocket.emit('motor', val);
            } else {
                console.log("robot not found with ip : " + ipRobot);
            }
        }
    });

    socket.on("is-interface", function (mode) { // We learn that the socket is the interface
        robotSockets.splice(robotSockets.indexOf(socket), 1);
        simulatorMode = (mode === "simulator");
        updateRobotsList(socket);
        console.log("remove interface");
    });

    socket.on("change-mode", function (val) { // User is changing the mode of the interface (simulator, manual, camera...)
        simulatorMode = (val === "simulator");
        // updateRobotsList(socket);
    });

    socket.on("disconnect", function () {
        console.log("Socket disconnected : ", socket.handshake.address);

        if (socketIps.includes(socket.handshake.address)) { // The disconnecting socket is a robot
            let index = socketIps.indexOf(socket.handshake.address);
            console.log(index);
            const removed = robotSockets.splice(index, 1);
            socketIps.splice(index, 1);

            console.log("retiré : ");
            console.log(removed);
        }
        updateRobotsList(socket);
    });
});

console.log(`Server is running on localhost:${port}`);


function updateRobotsList(socket) {
    let robots = [];

    console.log("updateRobotsList + " + socket.handshake.address);

    // We check if the robot has already been listed, if not, we add it to the robots list
    robotSockets.forEach(robotSocket => {
        let adresseIp = robotSocket.handshake.address;
        if (!robots.includes(adresseIp)) {
            robots.push(adresseIp);
        }
    })

    socket.emit("robots-list", robots);
    console.log("apres le emit de updateRobotsList");
}