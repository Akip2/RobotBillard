const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    World=Matter.World,
    Body=Matter.Body;

const width=720;
const height=350;


const COLLISION_FILTERS=Object.freeze({
    BALL: 0x0001,
    HOLE: 0x0002,
});

export{
    Engine,
    Render,
    Runner,
    Bodies,
    World,
    Composite,
    Body,
    width,
    height,
    COLLISION_FILTERS,
}