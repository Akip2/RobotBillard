class Billard {
    border = [];
    hole = [];

    constructor() {
        this.border = [];
        this.hole = [];
    }

}

let billard = new Billard();
let y_1 = 30;
let x_1 = 53;
let y_3 = 348;
let x_3 = 698;
let y_4 = 35;
let x_4 = 700;
let y_2 = 350;
let x_2 = 53;


billard.border.push([x_1, y_1]);
billard.border.push([x_2, y_2]);
billard.border.push([x_3, y_3]);
billard.border.push([x_4, y_4]);

// config hole on canvas
const initButtonHole = () => {
    for (let i = 1; i <= 6; i++) {
        billard.hole[i - 1].x = i*5;
        billard.hole[i - 1].y = i*10;
    }
}

initButtonHole();

console.log(billard.hole)
