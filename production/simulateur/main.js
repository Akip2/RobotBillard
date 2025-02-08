import VueSimulateur from "./vue-simulateur.js";
import CollisionController from "./collision-controller.js";
import BillardConfig from "./configurations/billard-config.js";

const canvasContainer = document.getElementById("canvas-container");

let vue = new VueSimulateur(canvasContainer);
let table = new BillardConfig(vue);
let colController = new CollisionController(table);

colController.createEvent(vue.engine);
table.run();
