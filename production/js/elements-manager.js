import {currentView, isSimulator, table} from "./events/view-manager.js";
import {getRealRobot} from "./video/video.js";
import {getRealBalls, getRealHoles} from "./video/video-functions.js";
import {selectRobots, selectRobotsSim} from "./index.js";
import {currentRobotId} from "./events/parameters.js";
import {BROADCAST} from "./brain/brain-parameters.js";

export let relationTable = new Map();

export function getRobot(id) {
    if (currentView === "simulator") {
        const detected = table.getRobotsDetected();
        const robot = detected.find(r => r.id === id);

        if (robot !== undefined) {
            return robot;
        }
    }
    return getRealRobot(id);
}

export function getBalls() {
    if (currentView === "simulator") {
        let balls = [];

        for (const ball of table.getBallsDetected()) {
            balls.push({
                x: ball.x,
                y: ball.y
            });
        }
        return balls;
    }
    return getRealBalls();
}

export function getHoles() {
    if (currentView === "simulator") {
        let holes = [];

        for (const hole of table.getHoles()) {
            holes.push({
                x: hole.body.position.x,
                y: hole.body.position.y
            });
        }
        return holes;
    }
    return getRealHoles();
}

export function setRelationTable(relTab) {
    relationTable = relTab;
}

export function getRobotIp(id) {
    if (isSimulator) {
        return id;
    } else {
        return id === BROADCAST ? BROADCAST : relationTable.get(id);
    }
}

export function addRobotToListOnNavigator(robotName) {
    let option = document.createElement("option");
    option.className = "option";
    option.text = robotName;

    if (currentView === "simulator") {
        selectRobotsSim.appendChild(option);
    } else {
        if (currentRobotId === robotName) {
            option.selected = true;
        }
        selectRobots.appendChild(option);
    }
}

export function getRobotsIds() {
    const ips = [];

    const options = isSimulator ? selectRobotsSim.options : selectRobots.options;
    if (isSimulator) {
        for (let i = 1; i < options.length; i++) {
            ips.push(i);
        }
    } else {
        for (let i = 0; i < options.length; i++) {
            const currentOption = options[i].text;
            if (currentOption !== BROADCAST) {
                ips.push(currentOption);
            }
        }
    }

    return ips;
}
