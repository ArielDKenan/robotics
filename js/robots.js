
robots = {};

(function (robots) {

    robots = robots || {};

    robots.PLAYER_MASS = 1;
    robots.PLAYER_DAMPING = .8;

    robots.preload = function preload() {
        game.load.image('rocket', 'images/grenada.png');
        game.load.image('sky', 'assets/sky.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.image('star', 'assets/star.png');
        game.load.image('gun', 'assets/machinegun.png');
        game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
        game.load.spritesheet('baddie', 'assets/baddie.png', 32, 32);
    };

    var pointer, badguy, platforms, stars, scoreText, mgun, score = 0;

    robots.create = function create() {

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.defaultRestitution = 0.8;

        game.stage.backgroundColor = '#2d2d2d';
        game.add.sprite(0, 0, 'sky');

        game.physics.p2.setBoundsToWorld(true, true, true, true, false);

        //  The platforms group contains the ground and the ledges
        platforms = game.add.group();
        platforms.enableBody = true;

        // Here we create the ground.
        var ground = platforms.create(0, game.world.height - 64, 'ground');
        ground.scale.setTo(2, 2);
        ground.body.immovable = true;

        //  Now let's create two ledges
        var ledge = platforms.create(400, 400, 'ground');
        ledge.body.immovable = true;

        ledge = platforms.create(-150, 250, 'ground');
        ledge.body.immovable = true;

        badguy = game.add.sprite(300, game.world.height - 150, 'dude');
        mgun = game.add.sprite(500, 500, 'gun');
        mgun.scale.setTo(.2, .2);

        game.physics.p2.enable(badguy);
        game.physics.p2.enable(mgun);
        game.camera.follow(badguy);

        badguy.body.fixedRotation = true;
        badguy.body.mass = robots.PLAYER_MASS;
        badguy.body.damping = robots.PLAYER_DAMPING;
        badguy.body.data.gravityScale = 1.5;

        mgun.body.collisionResponse = false;

        badguy.animations.add('left', [3, 2, 1, 0], 10, true);
        badguy.animations.add('right', [8, 7, 6, 5], 10, true);

        var rockets = game.add.group();

        cursors = game.input.keyboard.createCursorKeys();
        cursors.space = game.input.keyboard.addKey(32);
    };

    var Missile = function (game, x, y) {
        Phaser.Sprite.call(this, game, x, y, 'rocket');
        this.anchor.setTo(.5,.5);
        this.scale.setTo(.1,.1);
        game.physics.p2.enable(this);
        this.body.angularVelocity = 50;
        this.body.rotation = mgun.body.rotation - 1.5;
    };

    Missile.prototype = Object.create(Phaser.Sprite.prototype);
    Missile.prototype.constructor = Missile;

    robots.THRUST_SPEED = 350;
    robots.BOOST_SPEED = 1500;
    robots.boost_energy = 1000;
    robots.boost_wait = 0;
    robots.BOOST_MAX_WAIT = 1000;
    robots.nextFire = 0;

    robots.update = function update() {
        game.physics.arcade.collide(badguy, platforms);

        var thrustSpeed = robots.THRUST_SPEED;
        if (cursors.space.isDown && robots.boost_energy) {
            thrustSpeed = robots.BOOST_SPEED;
            robots.boost_energy -= 10;
        } else if (robots.boost_energy < 1000) {
            robots.boost_energy += 10;
        }

        if (cursors.left.isDown) {
            //badguy.body.rotateLeft(180);
            badguy.body.angle = 270;
            badguy.body.thrust(thrustSpeed);
            badguy.animations.play('left');
        } else if (cursors.right.isDown) {
            //badguy.body.rotateRight(180);
            badguy.body.angle = 90;
            badguy.body.thrust(thrustSpeed);
            badguy.animations.play('right');
        } else {
            badguy.body.setZeroRotation();
            badguy.animations.stop();
            badguy.frame = 4;
        }

        if (cursors.up.isDown) {
            badguy.body.angle = 0;
            badguy.body.thrust(thrustSpeed);
        } else if (cursors.down.isDown) {
            badguy.body.angle = 180;
            badguy.body.thrust(thrustSpeed);
            //badguy.body.reverse(thrustSpeed);
        }

        var FIRE_RATE = 400;

        mgun.body.rotation = game.math.angleBetween(mgun.body.x, mgun.body.y,
            game.input.activePointer.x, game.input.activePointer.y);

        if (game.input.activePointer.isDown) {
            if (game.time.now > robots.nextFire) {
                robots.nextFire = game.time.now + FIRE_RATE;
                var newM = game.add.existing(new Missile(this.game, mgun.body.x, mgun.body.y));
            }
        }
    }

})(robots);