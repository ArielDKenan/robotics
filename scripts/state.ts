
module robots {

    'use strict';

    /*** BOOT ***/

    export class Boot extends Phaser.State {

        constructor() {

            super();
            robots.log('Boot state.');

        }

        preload() {

            this.load.image('loading', 'assets/img/platform.png');

        }

        create() {

            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.pageAlignHorizontally = true;
            this.state.start('Preload', true);

        }

    }

    // Boot.prototype = Object.create(Phaser.State.prototype);
    // Boot.prototype.constructor = Boot;

    /*** PRELOAD ***/

    export class Preload extends Phaser.State {

        constructor() {

            super();
            robots.log('Preload state.');

        }

        preload() {

            var loadingBar = this.add.sprite(this.game.world.width / 2, this.game.world.height / 2, 'loading');
            loadingBar.anchor.setTo(0.5);
            this.load.setPreloadSprite(loadingBar);

            this.load.tilemap('map', 'assets/map/tilemap6.json', null, Phaser.Tilemap.TILED_JSON);

            this.load.image('tileset', 'assets/tiles/tileset.png');
            this.load.image('slanted', 'assets/tiles/tileset-slanted.png');
            this.game.load.image('slantless', 'assets/tiles/slopes_shallow.png');

            this.load.image('hills', 'assets/tiles/hills.png');
            this.load.image('stars', 'assets/tiles/stars.png');
            this.load.image('sky', 'assets/tiles/sky.png');
            this.load.image('skyline', 'assets/tiles/skyline.png');

            this.load.image('rocket', 'assets/img/grenada.png');
            this.load.image('bullet', 'assets/img/bullet.png');

            this.load.image('wheel', 'assets/img/kirby_wheel.png');
            this.load.image('gun', 'assets/img/machinegun.png');
            this.load.image('thruster', 'assets/img/thruster.png');
            this.load.image('body1', 'assets/img/body1.png');
            this.load.image('body2', 'assets/img/body2.png');

            this.load.image('star', 'assets/img/star.png');
            this.load.image('mario_star', 'assets/img/mario_star.png');

            this.load.spritesheet('explosion', 'assets/img/explosion_h.png', 200, 150);
            this.load.spritesheet('fire', 'assets/img/fire_anim.png', 64, 64);
            this.load.spritesheet('dude', 'assets/img/dude.png', 32, 48);
            this.load.spritesheet('baddie', 'assets/img/baddie.png', 32, 32);

        }

        create() {

            this.state.start('Arena', true);

        }

    };

 }

var game = new Phaser.Game(800, 640, Phaser.AUTO, 'game');

game.state.add('Boot', robots.Boot);
game.state.add('Preload', robots.Preload);
game.state.add('Arena', robots.Robotics);

game.state.start('Boot', true, true);
