import VueSimulateur from "./vue-simulateur.js";
import CollisionController from "./collision-controller.js";
import RandomConfig from "./configurations/random-config.js";
import BillardConfig from "./configurations/billard-config.js";

const canvasContainer=document.getElementById("canvas-container");

let vue=new VueSimulateur(canvasContainer);
vue.setup();
vue.run();

// let table=new RandomConfig(vue);
let table = new BillardConfig(vue);
let colController=new CollisionController(table);
colController.createEvent(vue.engine);
table.notifyView();