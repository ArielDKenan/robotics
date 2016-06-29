interface Array<T> {
    first: ()=>T;
}

Array.prototype.first = function () {
    return this[0];
}

interface IPoint {
    x: number;
    y: number;
}

interface IMovable {
    xVel: number;
    yVel: number;
}

interface I3DPoint extends IPoint {
    z: number;
}

var arr = [3, 2, 1];
var t = arr.first();
var arr2 = ['a', 'b', 'c'];
var t2 = arr2.first();

namespace robots {

    'use strict';

    export var npcCollisionGroup;

    function test(config): any {
        return config;
    }

    export class NPC extends Phaser.Sprite {

        path: IPoint[];
        pathIndex: number;

        constructor(x, y, key) {

            super(game, x, y, key);

            this.scale.setTo(.4);
            this.animations.add('fly', null, 30);

            this.game.physics.p2.enable(this, robots.DEBUG_MODE);

            this.body.data.gravityScale = 0;
            this.body.setCollisionGroup(npcCollisionGroup);
            this.body.collides([projectileCollisionGroup, projectileCollisionGroup2]);

        }

        begin(x: number[], y: number[]): void {

            this.animations.play('fly', null, true);
            this.plot(x, y);

        }

        plot(x: number[], y: number[]): void {

            this.pathIndex = 0;
            this.path = [];

            var res = Math.max(x.reduce((a, b) => Math.abs(b - a), 0), y.reduce((a, b) => Math.abs(b - a), 0));
            res = 1 / res;

            for (var i = 0; i <= 1; i += res) {
                var px = Phaser.Math.catmullRomInterpolation(x, i);
                var py = Phaser.Math.catmullRomInterpolation(y, i);

                var something = { 'x': px, 'y': py };
                this.path.push(something);
            }

        }

        update() {

            if (this.path) {
                this.x = this.path[this.pathIndex].x;
                this.y = this.path[this.pathIndex].y;

                this.pathIndex++;

                if (this.pathIndex >= this.path.length) {
                    this.pathIndex = 0;
                }
            }

        }

    }

}
