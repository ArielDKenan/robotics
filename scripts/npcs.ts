
module robots {

    'use strict';

    export var npcCollisionGroup;

    export class NPC extends Phaser.Sprite {

        path: Array<any>;
        pi: number;

        constructor(x, y, key) {

            super(game, x, y, key);
            game.add.existing(this);

            this.scale.setTo(.4);
            this.animations.add('fly', null, 30);

            game.physics.p2.enable(this, robots.DEBUG_MODE);

            this.body.data.gravityScale = 0;
            this.body.setCollisionGroup(npcCollisionGroup);
            this.body.collides([projectileCollisionGroup, projectileCollisionGroup2]);

            this.animations.play('fly', null, true);

        }

        plot(x: Array<number>, y: Array<number>) {

            this.pi = 0;
            this.path = [];

            var res = x.reduce((a, b) => a + b, 0);

            for (var i = 0; i <= 1; i += res) {
                var px = Phaser.Math.catmullRomInterpolation(x, i);
                var py = Phaser.Math.catmullRomInterpolation(y, i);

                this.path.push({ x: px, y: py });
            }

        }

        update() {

            if (this.path) {
                this.x = this.path[this.pi].x;
                this.y = this.path[this.pi].y;

                this.pi++;

                if (this.pi >= this.path.length) {
                    this.pi = 0;
                }
            }

        }

    }

}
