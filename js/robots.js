
robots = {};

(function (robots) {

    robots = robots || {};

    robots.DEBUG_MODE = false;

    robots.preload = function preload() {

        game.load.image('rocket', 'img/grenada.png');
        game.load.image('sky', 'assets/sky.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.image('star', 'assets/star.png');
        game.load.image('gun', 'assets/machinegun.png');
        game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
        game.load.spritesheet('baddie', 'assets/baddie.png', 32, 32);

    };

    var cursors, wasd, pointer, badguy, platforms, stars, scoreText, mgun, score = 0;
    var playerCollisionGroup, gunCollisionGroup, projectileCollisionGroup;
    var ROCKET_LAUNCHER = 1,
        MACHINEGUN = 2,
        selectedGun = ROCKET_LAUNCHER;
    var PLAYER_MASS = 1,
        PLAYER_DAMPING = .8;
    
    robots.create = function create() {

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.setImpactEvents(true); //  Turn on impact events for the world, without this we get no collision callbacks
        game.physics.p2.gravity.y = 1000;
        game.physics.p2.restitution = .2; // Default value for collision 'bouncing'

        playerCollisionGroup = game.physics.p2.createCollisionGroup();
        projectileCollisionGroup = game.physics.p2.createCollisionGroup();
        gunCollisionGroup = game.physics.p2.createCollisionGroup();
        game.physics.p2.updateBoundsCollisionGroup();

        // game.stage.backgroundColor = '#2d2d2d';
        game.add.sprite(0, 0, 'sky');

        // game.physics.p2.setBoundsToWorld(true, true, true, true, true);
        //game.physics.p2.setBounds(0, 0, 800, 600, true, true, true, true);

        //  The platforms group contains the ground and the ledges
        platforms = game.add.group();
        platforms.enableBody = true;

        // Here we create the ground.
        var ground = platforms.create(0, game.world.height - 8, 'ground');
        ground.scale.setTo(2, .2);
        ground.body.immovable = false;

        //  Now let's create two ledges
        /*var ledge = platforms.create(400, 400, 'ground');
        ledge.body.immovable = false;

        ledge = platforms.create(-150, 250, 'ground');
        ledge.body.immovable = true;*/

        badguy = game.add.sprite(300, game.world.height - 150, 'dude');
        badguy.scale.setTo(1.2);

        mgun = game.add.sprite(300, game.world.height - 140, 'gun');
        mgun.scale.setTo(.2, .2);

        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.P2JS;
        //bullets.createMultiple(50, 'rocket');
        for (var ctr=0; ctr<50; ctr++) {
            var bullet = bullets.create();
        }
        bullets.setAll('checkWorldBounds', true);
        bullets.setAll('outOfBoundsKill', true);

        game.physics.p2.enable(badguy, robots.DEBUG_MODE);
        game.physics.p2.enable(mgun, robots.DEBUG_MODE);
        game.camera.follow(badguy);

        badguy.body.setCircle(28);
        badguy.body.fixedRotation = true;
        badguy.body.mass = PLAYER_MASS;
        badguy.body.damping = PLAYER_DAMPING;
        badguy.body.data.gravityScale = 1;
        badguy.body.setCollisionGroup(playerCollisionGroup);
        //badguy.body.collides([projectileCollisionGroup]);

        mgun.body.setCollisionGroup(gunCollisionGroup);
        mgun.body.collides([]);
        mgun.body.data.gravityScale = 0;
        mgun.body.damping = PLAYER_DAMPING;

        badguy.animations.add('left', [3, 2, 1, 0], 10, true);
        badguy.animations.add('right', [8, 7, 6, 5], 10, true);

        var constraint = game.physics.p2.createLockConstraint(badguy, mgun, [0, 30], 9, 2000);

        cursors = game.input.keyboard.createCursorKeys();
        cursors.space = game.input.keyboard.addKey(32);

        wasd = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D)
        };

    };

    var Missile = function (game, x, y) {
        //this.rocket = missiles.getFirstDead();
        this.acceleration = 500;
        Phaser.Sprite.call(this, game, x, y, 'rocket');
        this.anchor.setTo(1, .5); // Set the pivot point for this sprite to the center
        this.scale.setTo(.15, .1);
        game.physics.p2.enable(this);
        //this.collisionGroup = ROCKETS_BIT;
        this.body.data.gravityScale = 0;
        this.body.setCollisionGroup(projectileCollisionGroup);
        this.body.collides([playerCollisionGroup], missleHit, this);
        this.body.collideWorldBounds = false;
        this.body.outOfBoundsKill = true;
        this.body.angle = mgun.body.angle - 90;
        //this.body.reverse(12000);
    };

    Missile.prototype = Object.create(Phaser.Sprite.prototype);
    Missile.prototype.constructor = Missile;

    Missile.prototype.update = function() {
        if (this.body) {
            this.body.reverse(this.acceleration);
        }
    }

    function missleHit(missile, player) {
        missile.destroy();
        missile.visible = false;
        console.log('hit!');
    }

    var MOVE_SPEED = 200,
        THRUST_SPEED = 0,
        BOOST_SPEED = 15000;
    var BOOST_COST = 30,
        BOOST_MAX_ENERGY = 8000,
        boost_energy = BOOST_MAX_ENERGY,
        boost_recharge_amount = 10,
        BOOST_DEPLETED_BONUS = 1500,
        BOOST_WAIT_TIME = 1000,
        boost_recharge_time = 0;
    var nextFire = 0;

    robots.update = function update() {

        // badguy.body.setZeroVelocity();
        var thrustSpeed = THRUST_SPEED;
        if (cursors.space.isDown && boost_energy>0) {
            thrustSpeed = BOOST_SPEED;
            boost_energy -= BOOST_COST;
        } else if (boost_energy < BOOST_MAX_ENERGY) {
            if (!boost_energy) {
                if (cursors.space.isDown) {
                    boost_recharge_time = 0;
                } else if (!boost_recharge_time) {
                    boost_recharge_time = game.time.now + BOOST_WAIT_TIME;
                } else if (game.time.now > boost_recharge_time) {
                    boost_recharge_time = 0;
                    boost_energy = BOOST_DEPLETED_BONUS;
                }
            } else {
                boost_energy += boost_recharge_amount;
            }
        }

        if (cursors.left.isDown || wasd.left.isDown) {
            //badguy.body.rotateLeft(180);
            badguy.body.angle = 270;
            badguy.body.moveLeft(MOVE_SPEED);
            badguy.body.thrust(thrustSpeed);
            badguy.animations.play('left');
        } else if (cursors.right.isDown || wasd.right.isDown) {
            //badguy.body.rotateRight(180);
            badguy.body.angle = 90;
            badguy.body.moveRight(MOVE_SPEED);
            badguy.body.thrust(thrustSpeed);
            badguy.animations.play('right');
        } else {
            badguy.body.setZeroRotation();
            badguy.animations.stop();
            badguy.frame = 4;
        }

        if (cursors.up.isDown || wasd.up.isDown) {
            badguy.body.angle = 0;
            badguy.body.moveUp(MOVE_SPEED);
            badguy.body.thrust(thrustSpeed);
        } else if (cursors.down.isDown || wasd.down.isDown) {
            // badguy.body.moveDown(MOVE_SPEED);
            badguy.body.angle = 180;
            badguy.body.thrust(thrustSpeed);
        }

        var ROCKET_FIRE_RATE = 250,
            MACHINE_FIRE_RATE = 100;
        var mouseX = game.input.activePointer.x;
        var mouseY = game.input.activePointer.y;

        mgun.body.rotation = game.math.angleBetween(mgun.body.x, mgun.body.y, mouseX, mouseY);

        if (game.input.activePointer.isDown) {
            if (selectedGun === ROCKET_LAUNCHER) {
                if (game.time.now > nextFire) {
                    nextFire = game.time.now + ROCKET_FIRE_RATE;
                    var newM = game.add.existing(new Missile(this.game, mgun.body.x, mgun.body.y));
                }
            } else if (selectedGun === MACHINEGUN) {

            }
        }

    }

    robots.render = function render() {

        game.debug.text('ROBOTS WILL INHERIT THE EARTH', 32, 32);
        game.debug.text('Boost Energy: ' + boost_energy, 32, 50);

    }

})(robots);