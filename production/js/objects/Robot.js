class Robot {

    constructor(arucoId, robotIp, x, y) {
        this.arucoId = arucoId;
        this.robotIp = robotIp;
        this.x = x;
        this.y = y;
    }

    getArucoId() {
        return this.arucoId;
    }

    getRobotIp() {
        return this.robotIp;
    }

    getPosition() {
        return {
            x: this.x,
            y: this.y
        };
    }
}