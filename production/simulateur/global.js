const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    World = Matter.World,
    Body = Matter.Body,
    Mouse = Matter.Mouse,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint;

const COLLISION_FILTERS = Object.freeze({
    BALL: 0x0001,
    BALL_CENTER: 0x0002,
    HOLE: 0x0004,
    ROBOT_BODY: 0x0008,
});

export {
    Engine,
    Render,
    Runner,
    Bodies,
    World,
    Composite,
    Body,
    Mouse,
    MouseConstraint,
    Constraint,
    COLLISION_FILTERS,
}
