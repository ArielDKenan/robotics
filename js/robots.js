
robots = {};
var mgun;
(function (robots) {

    'use strict';

    robots = robots || {};

    robots.DEBUG_MODE = false;

    robots.log = function (msg) {
        if (robots.DEBUG_MODE) {
            console.log('ROBOT DEBUG: ' + msg);
        }
    }

    robots.init = function () {
        if (robots.DEBUG_MODE) {
            this.log('DEBUG MODE IS ON');
        }
    }

    robots.preload = function preload() {

        game.load.tilemap('map', 'map/tilemap.json', null, Phaser.Tilemap.TILED_JSON);

        game.load.image('tileset', 'map/tileset.png');

        game.load.image('star', 'assets/star.png');
        game.load.image('sky', 'assets/sky.png');

        game.load.image('rocket', 'img/grenada.png');
        game.load.image('bullet', 'img/bullet.png');

        game.load.image('wheel', 'img/kirby_wheel.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.image('gun', 'assets/machinegun.png');
        game.load.image('thruster', 'img/thruster.png');
        game.load.image('body1', 'img/body1.png');
        game.load.image('body2', 'img/body2.png');

        game.load.spritesheet('fire', 'img/fire_anim.png', 64, 64);
        game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
        game.load.spritesheet('baddie', 'assets/baddie.png', 32, 32);

    };

    var badguy, wheel1, wheel2, thruster1, thruster2, leftWheel, rightWheel, fire1, fire2,
        platforms, bullets,
        cursors, wasd, pointer;
    var playerCollisionGroup, gunCollisionGroup, projectileCollisionGroup, wheelCollisionGroup,
        thrusterCollisionGroup;
    var constraint1, constraint2, constraint3;
    var ROCKET_LAUNCHER = 1,
        MACHINEGUN = 2,
        selectedGun = ROCKET_LAUNCHER;
    var PLAYER_MASS = 2,
        PLAYER_DAMPING = .1;//.8;
    
    var ROCKET_FIRE_RATE = 400,
        MACHINE_FIRE_RATE = 70;
    
    // todo: get rid of vars below
    var MAX_FORCE = 20000;
    
    robots.create = function create() {

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.setImpactEvents(true); //  Turn on impact events for the world, without this we get no collision callbacks
        game.physics.p2.gravity.y = 1500;
        game.physics.p2.restitution = 0; // Default value for collision 'bouncing'
        game.physics.p2.friction = 100;

        game.stage.backgroundColor = '#2d2d2d';

        var map = game.add.tilemap('map', 16, 16);

        //  Now add in the tileset
        map.addTilesetImage('tileset');
        
        //  Create our layer
        var layer = map.createLayer(0);

        //  Resize the world
        layer.resizeWorld();

        //  This isn't totally accurate, but it'll do for now
        map.setCollisionBetween(0, 4, true, layer, true);

        game.physics.p2.convertTilemap(map, layer);

        playerCollisionGroup = game.physics.p2.createCollisionGroup();
        projectileCollisionGroup = game.physics.p2.createCollisionGroup();
        gunCollisionGroup = game.physics.p2.createCollisionGroup();
        wheelCollisionGroup = game.physics.p2.createCollisionGroup();
        thrusterCollisionGroup = game.physics.p2.createCollisionGroup();
        game.physics.p2.updateBoundsCollisionGroup();
        // game.physics.p2.setBoundsToWorld(true, true, true, true, true);
        //game.physics.p2.setBounds(0, 0, 800, 600, true, true, true, true);

        /*var sky = game.add.sprite(0, 0, 'sky');
        sky.scale.set(1.5);

        //  The platforms group contains the ground and the ledges
        platforms = game.add.group();
        platforms.enableBody = true;

        // Here we create the ground.
        var ground = platforms.create(0, game.world.height - 8, 'ground');
        ground.scale.setTo(3, .2);
        ground.body.immovable = false;*/

        fire1 = game.add.sprite(270, game.world.height - 140, 'fire');
        fire2 = game.add.sprite(330, game.world.height - 140, 'fire');
        fire1.scale.setTo(.7);
        fire2.scale.setTo(.7);
        fire1.alpha = .8;
        fire2.alpha = .8;

        wheel1 = game.add.sprite(270, game.world.height - 10, 'wheel');
        wheel2 = game.add.sprite(295, game.world.height - 10, 'wheel');
        wheel1.scale.set(.04);
        wheel2.scale.set(.04);

        thruster1 = game.add.sprite(270, game.world.height - 150, 'thruster');
        thruster1.scale.setTo(.3, .3);
        thruster2 = game.add.sprite(330, game.world.height - 150, 'thruster');
        thruster2.scale.setTo(.3, .3);

        //badguy = game.add.sprite(300, game.world.height - 150, 'dude');
        //badguy.scale.setTo(1.2);
        badguy = game.add.sprite(300, game.world.height - 150, 'body2');
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

        game.physics.p2.enable([badguy, mgun, thruster1, thruster2], robots.DEBUG_MODE);
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

        thruster1.body.mass = 1;
        thruster2.body.mass = 1;
        thruster1.body.setCollisionGroup(thrusterCollisionGroup);
        thruster2.body.setCollisionGroup(thrusterCollisionGroup);

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

        fire1.animations.add('on', [5, 4, 3, 2, 1, 0, 1, 2, 3, 4], 15, true);
        fire2.animations.add('on', [7, 6, 5, 4, 3, 2, 1, 0, 1, 2, 3, 4, 5, 6], 20, true);
        fire1.animations.add('off', [8, 9, 10, 11, 12, 13, 14, 15, 14, 13, 12, 11, 10, 9], 5, true);
        fire2.animations.add('off', [8, 9, 10, 11, 12, 13, 14, 15, 14, 13, 12, 11, 10, 9], 5, true);

        constraint1 = game.physics.p2.createLockConstraint(badguy, mgun, [0, 30], 9, MAX_FORCE);
        constraint2 = game.physics.p2.createLockConstraint(badguy, thruster1, [35, 10], 0, MAX_FORCE);
        constraint3 = game.physics.p2.createLockConstraint(badguy, thruster2, [-35, 10], 0, MAX_FORCE);
        leftWheel = game.physics.p2.createRevoluteConstraint(badguy, [-(badguy.width/2),
            badguy.height/2], wheel1, [0, 0], MAX_FORCE);
        rightWheel = game.physics.p2.createRevoluteConstraint(badguy, [badguy.width/2,
            badguy.height/2], wheel2, [0, 0], MAX_FORCE);
        // Phaser.Physics.P2.addConstraint(constraint)
        //constraint2.enableMotor();
        //constraint3.enableMotor();

        cursors = game.input.keyboard.createCursorKeys();
        cursors.space = game.input.keyboard.addKey(32);
        robots.cursors = cursors;

        wasd = {
            up: game.input.keyboard.addKey(Phaser.Keyboard.W),
            down: game.input.keyboard.addKey(Phaser.Keyboard.S),
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D)
        };
        robots.wasd = wasd;

        var bodyPos = { x: 1, y: 1 };
        var b = game.add.existing(new parts.Body1(bodyPos));
        var g = game.add.existing(new parts.Chaingun({ x: 2, y: 0 }, b, bodyPos, parts.ROCKET_TYPE));
        var w1 = game.add.existing(new parts.Wheel({ x: 2, y: 3 }, b, bodyPos, { movesRight: true }));
        var w2 = game.add.existing(new parts.Wheel({ x: 3, y: 3 }, b, bodyPos, {}));
        var w3 = game.add.existing(new parts.Wheel({ x: 1, y: 3 }, b, bodyPos, {}));
        var w4 = game.add.existing(new parts.Wheel({ x: 0, y: 3 }, b, bodyPos, { movesLeft: true }));
        //var w5 = game.add.existing(new parts.Wheel({ x: 4, y: 3 }, b, bodyPos));
        var t1 = game.add.existing(new parts.Thruster({ x: 3, y: 1}, b, bodyPos));
        var t2 = game.add.existing(new parts.Thruster({ x: 0, y: 1}, b, bodyPos));

    };

    var Projectile = function (x, y, sprite, gun) {
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

        this.body.maintainAngle = gun.body.angle - 90;
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

    var Rocket = function (x, y, gun) {
        this.collideCallback = missleHit;
        Projectile.call(this, x, y, 'rocket', gun);
        this.scale.setTo(.15, .1);
        this.body.setCircle(15);
        this.body.data.gravityScale = 0;
        this._acceleration = 1000;
        this.body.moveBackward(50);
    }
    robots.Rocket = Rocket;

    Rocket.prototype = Object.create(Projectile.prototype);
    Rocket.prototype.constructor = Rocket;

    var Bullet = function (x, y, gun) {
        Projectile.call(this, x, y, 'bullet', gun);
        this.scale.setTo(.34, .34);
        this._speed = 2000;
        //this._acceleration = 1200;
    }
    robots.Bullet = Bullet;

    Bullet.prototype = Object.create(Projectile.prototype);
    Bullet.prototype.constructor = Bullet;

    function missleHit(missile, player) {
        //missile.destroy();
        missile.exists = false;
        robots.log('hit!');
    }

    var MOVE_SPEED = 0,
        MOTOR_SPEED = 20,
        THRUST_SPEED = 10000,
        BOOST_SPEED = 17000;
    var BOOST_COST = 0,
        BOOST_MAX_ENERGY = 10000,
        boost_energy = BOOST_MAX_ENERGY,
        boost_recharge_amount = 50,
        BOOST_DEPLETED_BONUS = 1500,
        BOOST_WAIT_TIME = 1000,
        boost_recharge_time = 0;
    var lastFire = 0;

    robots.update = function update() {

        // badguy.body.setZeroVelocity();
        var thrustSpeed = 0;
        var shouldAnimateFire = false;
        leftWheel.setMotorSpeed(0);
        rightWheel.setMotorSpeed(0);
        leftWheel.disableMotor();
        rightWheel.disableMotor();
        if  (boost_energy > BOOST_MAX_ENERGY) boost_energy = BOOST_MAX_ENERGY;
        if (cursors.space.isDown && boost_energy>0) {
            shouldAnimateFire = true;
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
            badguy.animations.play('left');

            leftWheel.enableMotor();
            leftWheel.setMotorSpeed(MOTOR_SPEED);

            thruster1.body.angle = 270;
            thruster2.body.angle = 270;
            thruster1.body.thrust(thrustSpeed);
            thruster2.body.thrust(thrustSpeed);
        } else if (cursors.right.isDown || wasd.right.isDown) {
            //badguy.body.rotateRight(180);
            //badguy.body.angle = 90;
            //badguy.body.moveRight(MOVE_SPEED);
            //badguy.body.thrust(thrustSpeed);
            badguy.animations.play('right');

            rightWheel.enableMotor();
            rightWheel.setMotorSpeed(-MOTOR_SPEED);

            thruster1.body.angle = 90;
            thruster2.body.angle = 90;
            thruster1.body.thrust(thrustSpeed);
            thruster2.body.thrust(thrustSpeed);
        } else {
            badguy.body.setZeroRotation();
            badguy.animations.stop();
            badguy.frame = 4;

            thruster1.body.setZeroRotation();
            thruster2.body.setZeroRotation();
        }

        if (cursors.up.isDown || wasd.up.isDown) {
            shouldAnimateFire = true;
            // badguy.body.angle = 0;
            badguy.body.moveUp(MOVE_SPEED);
            // badguy.body.thrust(thrustSpeed);

            thruster1.body.angle = 0;
            thruster1.body.thrust(thrustSpeed || THRUST_SPEED);
            thruster2.body.angle = 0;
            thruster2.body.thrust(thrustSpeed || THRUST_SPEED);
        } else if (cursors.down.isDown || wasd.down.isDown) {
            shouldAnimateFire = true;
            // badguy.body.moveDown(MOVE_SPEED);
            //badguy.body.angle = 180;
            //badguy.body.reverse(thrustSpeed);

            thruster1.body.angle = 180;
            thruster1.body.thrust(thrustSpeed || THRUST_SPEED)
            thruster2.body.angle = 180;
            thruster2.body.thrust(thrustSpeed || THRUST_SPEED)
        }

        
        fire1.angle = thruster1.angle;
        fire2.angle = thruster2.angle;

        var t1 = thruster1.getBounds(),
            t2 = thruster2.getBounds();

        fire1.x = t1.x;
        fire1.y = t1.y + t1.height/2;
        fire2.x = t2.x;
        fire2.y = t2.y + t2.height/2;

        if (shouldAnimateFire) {
            fire1.animations.play('on');
            fire2.animations.play('on');
        } else {
            fire1.animations.play('off');
            fire2.animations.play('off');
        }

        var mouseX = game.input.activePointer.x;
        var mouseY = game.input.activePointer.y;

        mgun.body.rotation = game.math.angleBetween(mgun.body.x, mgun.body.y, mouseX, mouseY);

        if (game.input.activePointer.isDown) {
            if (selectedGun === ROCKET_LAUNCHER) {
                if (game.time.now > lastFire + ROCKET_FIRE_RATE) {
                    lastFire = game.time.now;
                    var newR = game.add.existing(new Rocket(mgun.body.x, mgun.body.y, mgun));
                }
            } else if (selectedGun === MACHINEGUN) {
                if (game.time.now > lastFire + MACHINE_FIRE_RATE) {
                    lastFire = game.time.now;
                    var newB = game.add.existing(new Bullet(mgun.body.x, mgun.body.y, mgun));
                }
            }
        }

    }

    robots.render = function render() {

        var title = 'ROBOTS WILL INHERIT THE EARTH';
        if (robots.DEBUG_MODE) title += ' [[ DEBUG MODE ]]';
        game.debug.text(title, 32, 32);
        game.debug.text('Boost Energy: ' + boost_energy, 32, 50);

    }

})(robots);