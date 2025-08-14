let width = -1; let height = -1;
let bouleX=-1, bouleY = -1;

export function setVideoSize(videoW, videoH){
    width = videoW;
    height = videoH;
}

export function determinerTrou(robotX, robotY, robotDirection, bX, bY, trous){
    bouleX = bX;
    bouleY = bY;
    if (robotX!=-1 || robotY!=-1 || robotDirection!=-1 || bouleX!=-1 || bouleY!=-1 || trous!=[]){

        let trous2 = trous.map((t) => {
            //On calcule le vecteur entre le robot et la boule
            let vector_boule = {x: bouleX - t[0], y: bouleY - t[1]};

            // theta
            let theta_boule = Math.atan2(vector_boule.y, vector_boule.x) * 180 / Math.PI;
            if (theta_boule < 0) {
                theta_boule += 360;
            }

            //On calcule le vecteur entre le robot et la boule
            var vector_robot = {x: robotX - t[0], y: robotY - t[1]};

            // theta
            var theta_robot = Math.atan2(vector_robot.y, vector_robot.x) * 180 / Math.PI;
            if (theta_robot < 0) {
                theta_robot += 360;
            }
            return [t[0], t[1], Math.abs(Math.round(theta_boule)-Math.round(theta_robot))];
        });

        trous2.sort((a,b) => {
            return (a[2]>b[2]) ? 1 : -1;
        });

        return trous2[0];
    }
}