import {COLLISION_FILTERS} from "./global.js";

class CollisionController {
    constructor(table) {
        this.table = table;
    }

    createEvent(engine) {
        const table = this.table;

        Matter.Events.on(engine, 'collisionStart', function (event) {
            event.pairs.forEach(pair => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;

                let ballCenter = null;
                if (bodyA.collisionFilter.category === COLLISION_FILTERS.BALL_CENTER && bodyB.collisionFilter.category === COLLISION_FILTERS.HOLE) {
                    ballCenter = bodyA;
                }
                else if(bodyB.collisionFilter.category === COLLISION_FILTERS.BALL_CENTER && bodyA.collisionFilter.category === COLLISION_FILTERS.HOLE) {
                    ballCenter = bodyB;
                }

                if(ballCenter != null) {
                    console.log("BALL TOUCH HOLE");
                    const balls = table.getBalls();

                    balls.forEach(ball => {
                        if(ball.collisionCenter === ballCenter) {
                            table.removeBall(ball);
                        }
                    })
                }
            })
        });
    }
}

export default CollisionController;