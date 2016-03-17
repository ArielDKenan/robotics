
robots = {};
var mgun;
(function (robots) {

    "use strict";

    robots = robots || {};

    robots.DEBUG_MODE = true;

    robots.log = function (msg) {
        if (robots.DEBUG_MODE) {
            console.log(msg);
        }
    }

    robots.preload = function preload() {

        game.load.image('rocket', 'img/grenada.png');
        game.load.image('bullet', 'img/bullet.png');
        game.load.image('wheel', 'img/kirby_wheel.png');
        game.load.image('sky', 'assets/sky.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.image('star', 'assets/star.png');
        game.load.image('gun', 'assets/machinegun.png');
        game.load.image('body1', 'img/body1.png');
        game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
        game.load.spritesheet('baddie', 'assets/baddie.png', 32, 32);

    };

    var badguy, wheel1, wheel2, platforms, bullets, leftWheel, rightWheel,
        cursors, wasd, pointer;
    var playerCollisionGroup, gunCollisionGroup, projectileCollisionGroup, wheelCollisionGroup;
    var constraint1, constraint2, constraint3;
    var ROCKET_LAUNCHER = 1,
        MACHINEGUN = 2,
        selectedGun = ROCKET_LAUNCHER;
    var PLAYER_MASS = 1,
        PLAYER_DAMPING = 0;//.8;
    
    robots.create = function create() {

        var MAX_FORCE = 20000;

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.setImpactEvents(true); //  Turn on impact events for the world, without this we get no collision callbacks
        game.physics.p2.gravity.y = 1000;
        game.physics.p2.restitution = 0; // Default value for collision 'bouncing'
        game.physics.p2.friction = 100;

        playerCollisionGroup = game.physics.p2.createCollisionGroup();
        projectileCollisionGroup = game.physics.p2.createCollisionGroup();
        gunCollisionGroup = game.physics.p2.createCollisionGroup();
        wheelCollisionGroup = game.physics.p2.createCollisionGroup();
        game.physics.p2.updateBoundsCollisionGroup();
        // game.physics.p2.setBoundsToWorld(true, true, true, true, true);
        //game.physics.p2.setBounds(0, 0, 800, 600, true, true, true, true);

        // game.stage.backgroundColor = '#2d2d2d';
        var sky = game.add.sprite(0, 0, 'sky');
        sky.scale.set(1.5);

        //  The platforms group contains the ground and the ledges
        platforms = game.add.group();
        platforms.enableBody = true;

        // Here we create the ground.
        var ground = platforms.create(0, game.world.height - 8, 'ground');
        ground.scale.setTo(3, .2);
        ground.body.immovable = false;

        wheel1 = game.add.sprite(270, game.world.height - 10, 'wheel');
        wheel2 = game.add.sprite(295, game.world.height - 10, 'wheel');
        wheel1.scale.set(.04);
        wheel2.scale.set(.04);

        //badguy = game.add.sprite(300, game.world.height - 150, 'dude');
        //badguy.scale.setTo(1.2);
        badguy = game.add.sprite(300, game.world.height - 150, 'body1');
        badguy.scale.set(.08);

        mgun = game.add.sprite(300, game.world.height - 140, 'gun');
        mgun.scale.setTo(.2, .2);

        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.P2JS;
        bullets.createMultiple(50, 'bullet');
        /*for (var ctr=0; ctr<50; ctr++) {
            var bullet = bullets.create();
        }
        bullets.setAll('checkWorldBounds', true);
        bullets.setAll('outOfBoundsKill', true);*/

        game.physics.p2.enable([badguy, mgun], robots.DEBUG_MODE);
        game.physics.p2.enable([wheel1, wheel2], robots.DEBUG_MODE);
        game.camera.follow(badguy);

        wheel1.body.mass = 1;
        wheel2.body.mass = 1;
        wheel1.body.setCircle(18);
        wheel2.body.setCircle(18);
        wheel1.body.setCollisionGroup(wheelCollisionGroup);
        wheel2.body.setCollisionGroup(wheelCollisionGroup);
        //wheel1.body.collides(playerCollisionGroup);
        //wheel2.body.collides(playerCollisionGroup);

        badguy.body.setCircle(25);
        badguy.body.fixedRotation = false;
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

        constraint1 = game.physics.p2.createLockConstraint(badguy, mgun, [0, 30], 9, MAX_FORCE);
        leftWheel = game.physics.p2.createRevoluteConstraint(badguy, [-(badguy.width/2),
            badguy.height/2], wheel1, [0, 0], MAX_FORCE);
        rightWheel = game.physics.p2.createRevoluteConstraint(badguy, [badguy.width/2,
            badguy.height/2], wheel2, [0, 0], MAX_FORCE);
        // Phaser.Physics.P2.addConstraint(constraint)
        //constraint2.enableMotor();
        //constraint3.enableMotor();

        cursors = game.input.keyboard.createCursorKeys();
        cursors.space = game.input.keyboard.addKey(32);

        wasd = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D)
        };

    };

    var Projectile = function (x, y, sprite) {
        this._acceleration = 0;
        this._speed = 0;
        this.collideCallback = this.collideCallback || function () {};

        Phaser.Sprite.call(this, game, x, y, sprite);
        //Phaser.SpriteBatch.call(this, game, bullets, 'bullet', true)
        //this.bully = bullets.getFirstDead.call(this);
        //this.bully.reset(x, y);
        //game.physics.p2.

        this.anchor.setTo(.5, .5);

        game.physics.p2.enable(this, robots.DEBUG_MODE);
        this.body.data.gravityScale = 0;

        this.body.setCollisionGroup(projectileCollisionGroup);
        this.body.collides([playerCollisionGroup], this.collideCallback, this);
        this.body.collideWorldBounds = false;
        this.body.outOfBoundsKill = true;

        this.body.maintainAngle = mgun.body.angle - 90;
        this.body.angle = this.body.maintainAngle;
        this.fixedRotate = true;
    };

    Projectile.prototype = Object.create(Phaser.Sprite.prototype);
    Projectile.prototype.constructor = Projectile;

    Projectile.prototype.update = function() {
        if (this.body) {
            if (this.fixedRotate) this.body.angle = this.body.maintainAngle;
            if (this._speed) this.body.moveBackward(this._speed);
            this.body.reverse(this._acceleration);
        } else if (this.destroy) {
            this.destroy();
        }
    }

    var Rocket = function (x, y) {
        this.collideCallback = missleHit;
        Projectile.call(this, x, y, 'rocket');
        this.scale.setTo(.15, .1);
        this.body.setCircle(15);
        this.body.data.gravityScale = 0;
        this._acceleration = 800;
    }

    Rocket.prototype = Object.create(Projectile.prototype);
    Rocket.prototype.constructor = Rocket;

    var Bullet = function (x, y) {
        Projectile.call(this, x, y, 'bullet');
        this.scale.setTo(.34, .34);
        this._speed = 2000;
        //this._acceleration = 1200;
    }

    Bullet.prototype = Object.create(Projectile.prototype);
    Bullet.prototype.constructor = Bullet;

    function missleHit(missile, player) {
        //missile.destroy();
        missile.exists = false;
        console.log('hit!');
    }

    var MOVE_SPEED = 0,
        MOTOR_SPEED = 20,
        THRUST_SPEED = 0,
        BOOST_SPEED = 17000;
    var BOOST_COST = 30,
        BOOST_MAX_ENERGY = 8000,
        boost_energy = BOOST_MAX_ENERGY,
        boost_recharge_amount = 10,
        BOOST_DEPLETED_BONUS = 1500,
        BOOST_WAIT_TIME = 1000,
        boost_recharge_time = 0;
    var lastFire = 0;

    robots.update = function update() {

        // badguy.body.setZeroVelocity();
        var thrustSpeed = THRUST_SPEED;
        leftWheel.setMotorSpeed(0);
        rightWheel.setMotorSpeed(0);
        leftWheel.disableMotor();
        rightWheel.disableMotor();
        if (cursors.space.isDown && boost_energy>0) {
            thrustSpeed = BOOST_SPEED;
            if (!robots.DEBUG_MODE) boost_energy -= BOOST_COST;
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
            //badguy.body.angle = 270;
            //badguy.body.moveLeft(MOVE_SPEED);
            //badguy.body.thrust(thrustSpeed);
            leftWheel.enableMotor();
            leftWheel.setMotorSpeed(MOTOR_SPEED);
            badguy.animations.play('left');
        } else if (cursors.right.isDown || wasd.right.isDown) {
            //badguy.body.rotateRight(180);
            //badguy.body.angle = 90;
            //badguy.body.moveRight(MOVE_SPEED);
            //badguy.body.thrust(thrustSpeed);
            rightWheel.enableMotor();
            rightWheel.setMotorSpeed(-MOTOR_SPEED);
            badguy.animations.play('right');
        } else {
            badguy.body.setZeroRotation();
            badguy.animations.stop();
            badguy.frame = 4;
        }

        if (cursors.up.isDown || wasd.up.isDown) {
            // badguy.body.angle = 0;
            badguy.body.moveUp(MOVE_SPEED);
            badguy.body.thrust(thrustSpeed);
        } else if (cursors.down.isDown || wasd.down.isDown) {
            // badguy.body.moveDown(MOVE_SPEED);
            //badguy.body.angle = 180;
            badguy.body.reverse(thrustSpeed);
        }

        var ROCKET_FIRE_RATE = 400,
            MACHINE_FIRE_RATE = 70;
        var mouseX = game.input.activePointer.x;
        var mouseY = game.input.activePointer.y;

        mgun.body.rotation = game.math.angleBetween(mgun.body.x, mgun.body.y, mouseX, mouseY);

        if (game.input.activePointer.isDown) {
            if (selectedGun === ROCKET_LAUNCHER) {
                if (game.time.now > lastFire + ROCKET_FIRE_RATE) {
                    lastFire = game.time.now;
                    var newR = game.add.existing(new Rocket(mgun.body.x, mgun.body.y));
                }
            } else if (selectedGun === MACHINEGUN) {
                if (game.time.now > lastFire + MACHINE_FIRE_RATE) {
                    lastFire = game.time.now;
                    var newB = game.add.existing(new Bullet(mgun.body.x, mgun.body.y));
                }
            }
        }

    }

    robots.render = function render() {

        game.debug.text('ROBOTS WILL INHERIT THE EARTH', 32, 32);
        game.debug.text('Boost Energy: ' + boost_energy, 32, 50);

    }

})(robots);