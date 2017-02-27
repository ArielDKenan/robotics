
interface Array<T> {
    first: ()=>T;
}

Array.prototype.first = function () {
    return this[0];
}

'use strict';

namespace robots {

    'use strict';

    export var npcCollisionGroup;

    export class NPC extends Phaser.Sprite {

        path: IPoint[];
        pathIndex: number;
        running: boolean;

        constructor(x, y, key) {

            super(game, x, y, key);

            this.running = false;

        }

        begin(x: number[], y: number[]): void {

            this.animations.play('fly', null, true);
            // this.plot(x, y);
            // this.running = true;

        }

        plot(x: number[], y: number[]): void {

            this.pathIndex = 0;
            this.path = [];

            var summer = (a, b) => { Math.abs(b - a) }
            var res = 1 / Math.max(x.reduce(summer, 0), y.reduce(summer, 0));

            for (var i = 0; i <= 1; i += res) {
                var px = Phaser.Math.catmullRomInterpolation(x, i);
                var py = Phaser.Math.catmullRomInterpolation(y, i);

                var something = { x: px, y: py };
                this.path.push(something);
            }

        }

        update() {

            if (this.running) {
                this.x = this.path[this.pathIndex].x;
                this.y = this.path[this.pathIndex].y;

                if (++this.pathIndex >= this.path.length) this.pathIndex = 0;
            }

        }

    }

    export class Drone extends NPC {

        constructor(x, y) {

            super(x, y, 'drone');
            
            this.scale.setTo(.4);
            this.animations.add('fly', null, 30);

            this.game.physics.p2.enable(this, robots.DEBUG_MODE);

            this.body.setCollisionGroup(npcCollisionGroup);
            this.body.collides([projectileCollisionGroup, projectileCollisionGroup2]);

            this.body.data.gravityScale = 0;

        }

    }

}
