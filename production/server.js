const path = require("path");
const express = require('express');
const app = express();
const server = require('http').createServer(app);

let robotSockets = []; // use to stock robots sockets (all data about a robot)
let socketIps = []; // use to stock robots ip (example : ::ffff:192.168.137.100)
let isSimulator = false;
let socketInterface = null; // socket to communicate with the navigator

const io = require('socket.io').listen(server, {
    pingInterval: 5000,
    pingTimeout: 5000,
});

const port = 8001;
const BROADCAST = "Broadcast";

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

    if (!socketIps.includes(socket.handshake.address)) {
        addNewSocket(socket);
    } else { // Socket with this ip already exists, we replace it with the new one
        updateSocket(socket);
    }

    socket.on("motor", function (val) {
        console.log("motor" + JSON.stringify(val));

        let ipRobot = val.ipRobot;

        if (isSimulator) {
            socket.emit("motor", val);
        } else {
            if (ipRobot === BROADCAST) { // Broadcast
                socket.broadcast.emit("motor", val);
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
        }
    });

    socket.on("is-interface", function (mode) { // We learn that the socket is the interface
        isSimulator = (mode === "simulator");
        socketInterface = socket;
        removeSocket(socket);
        console.log("remove interface");
    });

    socket.on("change-mode", function (val) { // User is changing the mode of the interface (simulator, manual, camera...)
        isSimulator = (val === "simulator");
    });

    socket.on("disconnect", function () {
        console.log("Socket disconnected : ", socket.handshake.address);
        removeSocket(socket);
    });
});

function addNewSocket(socket) {
    robotSockets.push(socket); // We assume the connecting socket is a robot
    socketIps.push(socket.handshake.address);
    sendRobotListToNavigator();
}

function updateSocket(socket) {
    let index = socketIps.indexOf(socket.handshake.address);
    robotSockets[index] = socket;
    sendRobotListToNavigator()
}

function removeSocket(socket) {
    let indexRS = robotSockets.indexOf(socket);
    if (indexRS !== -1) {
        robotSockets.splice(indexRS, 1);
    }

    let indexSI = socketIps.indexOf(socket.handshake.address);
    if (indexSI !== -1) {
        socketIps.splice(indexSI, 1);
    }
    sendRobotListToNavigator();
}

function sendRobotListToNavigator() {
    if (socketInterface !== null) {
        socketInterface.emit("robots-list", socketIps);
    }
}

console.log(`Server is running on http://localhost:${port}`);
