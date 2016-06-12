
;var robots = window.robots = window.robots || {};

~function (robots) {

    'use strict';

    /*** BOOT ***/

    var Boot = function (game) {

    	robots.log('Boot state.');

    };
    robots.Boot = Boot;

    Boot.prototype = Object.create(Phaser.State.prototype);
    Boot.prototype.constructor = Boot;

    Boot.prototype.preload = function () {

        this.load.image('loading', 'assets/platform.png');

    };

    Boot.prototype.create = function () {

    	this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    	this.scale.pageAlignHorizontally = true;
    	this.state.start('Preload', true);

    };

    /*** PRELOAD ***/

    var Preload = function (game) {

    	robots.log('Preload state.');

    };
    robots.Preload = Preload;

    Preload.prototype = Object.create(Phaser.State.prototype);
    Preload.prototype.constructor = Preload;

    Preload.prototype.preload = function () {

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
        this.load.image('gun', 'assets/machinegun.png');
        this.load.image('thruster', 'assets/img/thruster.png');
        this.load.image('body1', 'assets/img/body1.png');
        this.load.image('body2', 'assets/img/body2.png');

        this.load.image('star', 'assets/star.png');
        this.load.image('mario_star', 'assets/img/mario_star.png');

        this.load.spritesheet('explosion', 'assets/img/explosion_h.png', 200, 150);
        this.load.spritesheet('fire', 'assets/img/fire_anim.png', 64, 64);
        this.load.spritesheet('dude', 'assets/img/dude.png', 32, 48);
        this.load.spritesheet('baddie', 'assets/img/baddie.png', 32, 32);

    };

    Preload.prototype.create = function () {

    	this.state.start('Arena', true);

    }

 }(window.robots = window.robots || {});
