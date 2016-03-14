
robots = {};

(function (robots) {

    var cursors;
    var wasd;
    var ROCKETS_BIT = 1;//Math.pow(2, 0),
    var PLAYER_BIT = 1;//Math.pow(2, 1),
    var GUN_BIT = 1;//Math.pow(2, 2);

    robots = robots || {};

    robots.PLAYER_MASS = 1;
    robots.PLAYER_DAMPING = .8;

    robots.missleHit = function missleHit(player, missile) {
        missile.kill();
        console.log('hit!');
    };

    robots.preload = function preload() {

        game.load.image('rocket', 'img/grenada.png');
        game.load.image('sky', 'assets/sky.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.image('star', 'assets/star.png');
        game.load.image('gun', 'assets/machinegun.png');
        game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
        game.load.spritesheet('baddie', 'assets/baddie.png', 32, 32);

    };

    var pointer, badguy, platforms, stars, scoreText, mgun, score = 0;
    var playerCollisionGroup, projectileCollisionGroup;

    robots.create = function create() {

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.startSystem(Phaser.Physics.P2JS);
        //  Turn on impact events for the world, without this we get no collision callbacks
        game.physics.p2.setImpactEvents(true);
        game.physics.p2.defaultRestitution = 0.8;

        playerCollisionGroup = game.physics.p2.createCollisionGroup();
        projectileCollisionGroup = game.physics.p2.createCollisionGroup();

        game.stage.backgroundColor = '#2d2d2d';
        game.add.sprite(0, 0, 'sky');

        game.physics.p2.setBoundsToWorld(true, true, true, true, true);

        var playerGroup = game.physics.p2.createCollisionGroup();
        var gunGroup = game.physics.p2.createCollisionGroup();

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
        badguy.scale.setTo(1.3);

        mgun = game.add.sprite(500, 500, 'gun');
        mgun.scale.setTo(.2, .2);

        game.physics.p2.enable(badguy);
        game.physics.p2.enable(mgun);
        game.camera.follow(badguy);

        badguy.body.fixedRotation = true;
        badguy.body.mass = robots.PLAYER_MASS;
        badguy.body.damping = robots.PLAYER_DAMPING;
        badguy.body.data.gravityScale = 1.5;
        // badguy.body.collisionGroup = PLAYER_BIT;
        badguy.body.setCollisionGroup(playerCollisionGroup);
        badguy.body.collides(projectileCollisionGroup, robots.missileHit, this); //callback for collision

        mgun.body.collisionResponse = false;
        mgun.body.collisionGroup = GUN_BIT;
        mgun.body.setCollisionGroup(playerGroup);

        badguy.animations.add('left', [3, 2, 1, 0], 10, true);
        badguy.animations.add('right', [8, 7, 6, 5], 10, true);

        var rockets = game.add.group();

        cursors = game.input.keyboard.createCursorKeys();
        cursors.space = game.input.keyboard.addKey(32);

        wasd = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D)
        };

        badguy.body.collisionMask = PLAYER_BIT

    };

    var Missile = function (game, x, y, x2, y2) {
        this._this = this;
        Phaser.Sprite.call(this, game, x, y, 'rocket');
        this.anchor.setTo(1, .5);
        this.scale.setTo(.15, .1);
        game.physics.p2.enable(this);
        //this.collisionGroup = ROCKETS_BIT;
        this.body.setCollisionGroup(projectileCollisionGroup);
        this.body.collides([projectileCollisionGroup, playerCollisionGroup]);
        this.body.angle = mgun.body.angle - 90;
        this.body.reverse(12000);
    };

    Missile.prototype = Object.create(Phaser.Sprite.prototype);
    Missile.prototype.constructor = Missile;

    robots.MOVE_SPEED = 200;
    robots.THRUST_SPEED = 0;
    robots.BOOST_SPEED = 15000;
    robots.boost_energy = 1000;
    robots.boost_wait = 0;
    robots.BOOST_MAX_WAIT = 1000;
    robots.nextFire = 0;

    robots.update = function update() {

        // badguy.body.setZeroVelocity();
        var thrustSpeed = robots.THRUST_SPEED;
        if (cursors.space.isDown) {
            thrustSpeed = robots.BOOST_SPEED;
            // robots.boost_energy -= 10;
        } else if (robots.boost_energy < 1000) {
            // robots.boost_energy += 10;
        }

        if (cursors.left.isDown || wasd.left.isDown) {
            //badguy.body.rotateLeft(180);
            badguy.body.angle = 270;
            badguy.body.moveLeft(robots.MOVE_SPEED);
            badguy.body.thrust(thrustSpeed);
            badguy.animations.play('left');
        } else if (cursors.right.isDown || wasd.right.isDown) {
            //badguy.body.rotateRight(180);
            badguy.body.angle = 90;
            badguy.body.moveRight(robots.MOVE_SPEED);
            badguy.body.thrust(thrustSpeed);
            badguy.animations.play('right');
        } else {
            badguy.body.setZeroRotation();
            badguy.animations.stop();
            badguy.frame = 4;
        }

        if (cursors.up.isDown || wasd.up.isDown) {
            badguy.body.angle = 0;
            badguy.body.moveUp(robots.MOVE_SPEED);
            badguy.body.thrust(thrustSpeed);
        } else if (cursors.down.isDown || wasd.down.isDown) {
            badguy.body.moveDown(robots.MOVE_SPEED);
            badguy.body.angle = 180;
            badguy.body.thrust(thrustSpeed);
        }

        var FIRE_RATE = 400;
        var mouseX = game.input.activePointer.x;
        var mouseY = game.input.activePointer.y;

        mgun.body.rotation = game.math.angleBetween(mgun.body.x, mgun.body.y, mouseX, mouseY);

        if (game.input.activePointer.isDown) {
            if (game.time.now > robots.nextFire) {
                robots.nextFire = game.time.now + FIRE_RATE;
                var newM = game.add.existing(new Missile(this.game, mgun.body.x, mgun.body.y, mouseX, mouseY));
            }
        }

    }

    robots.render = function render() {

        game.debug.text('ROBOTS WILL INHERIT THE EARTH', 32, 32);

    }

})(robots);