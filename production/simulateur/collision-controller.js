import {COLLISION_FILTERS} from "./global.js";

class CollisionController{
    constructor(table){
        this.table = table;
    }

    createEvent(engine){
        const table=this.table;

        Matter.Events.on(engine, 'collisionStart', function(event) {
            event.pairs.forEach(pair => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;

                const balls=table.getBalls();

                balls.forEach(ball => {
                    if (bodyA === ball.body || bodyB === ball.body) {
                        const otherBody = (bodyA === ball.body) ? bodyB : bodyA;

                        if (otherBody.collisionFilter.category === COLLISION_FILTERS.HOLE) { //ball collides with hole
                            console.log("ball touch hole");
                            table.removeBall(ball);
                        }
                    }
                });
            });
        });
    }
}

export default CollisionController;