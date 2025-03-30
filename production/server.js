const path = require("path");
const express = require('express');
const app = express();
const server = require('http').createServer(app);

let robotsSockets = []; // use to stock robots sockets (all data about a robot)
let socketIps = []; // use to stock robots ip (example : ::ffff:192.168.137.100)
let isSimulator = false;
let socketInterface = null; // socket to communicate with the navigator

const relationTable = new Map();

const io = require('socket.io').listen(server, {
    pingInterval: 10000,
    pingTimeout: 30000,
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

                while (i < robotsSockets.length && !found) {
                    robotSocket = robotsSockets[i];
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

    socket.on("identification", function (data) {
        if (data["type"] === "interface") { //Socket is the interface
            console.log("identification : interface");

            removeSocket(socket);
            isSimulator = (data["mode"] === "simulator");
            socketInterface = socket;
        } else { //Socket is robot
            console.log("new robot with id : " + data["id"]);
            relationTable.set(data["id"], socket.handshake.address);
            sendRobotTableToNavigator();
        }
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
    robotsSockets.push(socket);
    socketIps.push(socket.handshake.address);
    // sendRobotTableToNavigator();
}

function updateSocket(socket) {
    let index = socketIps.indexOf(socket.handshake.address);
    robotsSockets[index] = socket;
    sendRobotTableToNavigator();
}

function removeSocket(socket) {
    let indexRS = robotsSockets.indexOf(socket);
    if (indexRS !== -1) {
        robotsSockets.splice(indexRS, 1);
    }

    for (const [key, value] of relationTable) {
        if (value === socket.handshake.address) {
            relationTable.delete(key);
            break;
        }
    }

    let indexSI = socketIps.indexOf(socket.handshake.address);
    if (indexSI !== -1) {
        socketIps.splice(indexSI, 1);
    }
    sendRobotTableToNavigator();
}

function sendRobotTableToNavigator() {
    if (socketInterface !== null) {
        const stringifiedTable = JSON.stringify(Array.from(relationTable));
        socketInterface.emit("robots-list", stringifiedTable);
    }
}

console.log(`Server is running on http://localhost:${port}`);
