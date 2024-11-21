var Example = Example || {};

Example.ballPool = function() {
    try {
        if (typeof MatterWrap !== 'undefined') {
            // either use by name from plugin registry (Browser global)
            Matter.use('matter-wrap');
        } else {
            // or require and use the plugin directly (Node.js, Webpack etc.)
            Matter.use(require('matter-wrap'));
        }
    } catch (e) {
        // could not require the plugin or install needed
    }

    var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Common = Matter.Common,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        Bodies = Matter.Bodies;

    // create engine
    var engine = Engine.create(),
        world = engine.world;

    engine.gravity.y = 0;

    // create renderer
    var render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            showAngleIndicator: true
        }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    // add bodies
    Composite.add(world, [
        Bodies.rectangle(400, 600, 1200, 50.5, { isStatic: true, render: { fillStyle: '#060a19' } }),
        Bodies.rectangle(400, 0, 1200, 50.5, { isStatic: true, render: { fillStyle: '#060a19' } }),
        Bodies.rectangle(0, 0, 50.5, 1200, { isStatic: true, render: { fillStyle: '#060a19' } }),
        Bodies.rectangle(800, 600, 50.5, 1200, { isStatic: true, render: { fillStyle: '#060a19' } })
    ]);

    Composite.add(world, [
        Bodies.circle(200, 300, 15, { restitution: 0.6, friction: 0.1 }),

        Bodies.circle(600, 360, 15, { restitution: 0.6, friction: 0.1 }),
        Bodies.circle(600, 330, 15, { restitution: 0.6, friction: 0.1 }),
        Bodies.circle(600, 300, 15, { restitution: 0.6, friction: 0.1 }),
        Bodies.circle(600, 270, 15, { restitution: 0.6, friction: 0.1 }),
        Bodies.circle(600, 240, 15, { restitution: 0.6, friction: 0.1 }),

        Bodies.circle(570, 345, 15, { restitution: 0.6, friction: 0.1 }),
        Bodies.circle(570, 315, 15, { restitution: 0.6, friction: 0.1 }),
        Bodies.circle(570, 275, 15, { restitution: 0.6, friction: 0.1 }),
        Bodies.circle(570, 245, 15, { restitution: 0.6, friction: 0.1 }),
    ]);

    // add mouse control
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    Composite.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    // fit the render viewport to the scene
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: 800, y: 600 }
    });

    // wrapping using matter-wrap plugin
    var allBodies = Composite.allBodies(world);

    for (var i = 0; i < allBodies.length; i += 1) {
        allBodies[i].plugin.wrap = {
            min: { x: render.bounds.min.x - 100, y: render.bounds.min.y },
            max: { x: render.bounds.max.x + 100, y: render.bounds.max.y }
        };
    }

    // context for MatterTools.Demo
    return {
        engine: engine,
        runner: runner,
        render: render,
        canvas: render.canvas,
        stop: function() {
            Matter.Render.stop(render);
            Matter.Runner.stop(runner);
        }
    };
};

Example.ballPool.title = 'Ball Pool';
Example.ballPool.for = '>=0.14.2';

if (typeof module !== 'undefined') {
    module.exports = Example.ballPool;
}
Example.ballPool();