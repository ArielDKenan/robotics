
robots = {};
var mgun;
(function (robots) {

    'use strict';

    robots = robots || {};

    robots.DEBUG_MODE = true;

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

        game.load.tilemap('map', 'map/tilemap4.json', null, Phaser.Tilemap.TILED_JSON);

        game.load.image('tileset', 'map/tileset.png');
        game.load.image('slanted', 'map/tileset-slanted.png');
        game.load.image('slantless', 'map/slopes_shallow.png');

        game.load.image('hills', 'map/hills.png');
        game.load.image('stars', 'map/stars.png');
        game.load.image('sky', 'assets/sky.png');

        game.load.image('rocket', 'img/grenada.png');
        game.load.image('bullet', 'img/bullet.png');

        game.load.image('wheel', 'img/kirby_wheel.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.image('gun', 'assets/machinegun.png');
        game.load.image('thruster', 'img/thruster.png');
        game.load.image('body1', 'img/body1.png');
        game.load.image('body2', 'img/body2.png');

        game.load.image('star', 'assets/star.png');
        game.load.image('mario_star', 'img/mario_star.png');

        game.load.spritesheet('explosion', 'img/explosion_h.png', 200, 150);
        game.load.spritesheet('fire', 'img/fire_anim.png', 64, 64);
        game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
        game.load.spritesheet('baddie', 'assets/baddie.png', 32, 32);

    };

    var badguy, wheel1, wheel2, thruster1, thruster2, leftWheel, rightWheel, fire1, fire2,
        platforms, bullets, hills,
        cursors, wasd, pointer;
    var playerCollisionGroup, player2CollisionGroup, gunCollisionGroup, wheelCollisionGroup,
        projectileCollisionGroup, projectileCollisionGroup2, thrusterCollisionGroup,
        tilesCollisionGroup, collectCollisionGroup;
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
    var collectLayer;
    robots.create = function create() {

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.setImpactEvents(true); //  Turn on impact events for the world, without this we get no collision callbacks
        game.physics.p2.gravity.y = 1500;
        game.physics.p2.restitution = 0; // Default value for collision 'bouncing'
        game.physics.p2.friction = 100;

        game.stage.backgroundColor = '#2d2d2d';

        var sky = game.add.sprite(0, 0, 'sky');
        sky.scale.set(14, 1);

        var stars = game.add.tileSprite(0, 0, 640, 800, 'stars');
        stars.scale.setTo(1.25, 1.57);
        stars.fixedToCamera = true;

        //var hills = game.add.sprite(0, 0, 'hills');
        hills = game.add.tileSprite(0, 0, 1956, 640, 'hills');
        hills.fixedToCamera = true;
        //var hills2 = game.add.tileSprite(1956, 0, 1956, 640, 'hills');

        var map = game.add.tilemap('map', 16, 16);
        map.addTilesetImage('tileset');
        map.addTilesetImage('mario_star');
        map.addTilesetImage('slanted');
        map.addTilesetImage('slantless');
        
        //  Create our layer
        var layer = map.createLayer('Tile Layer 1');
        collectLayer = map.createLayer('Collect Layer');

        //  Resize the world
        layer.resizeWorld();

        var tileObjects = game.physics.p2.convertTilemap(map, layer);

        //  This isn't totally accurate, but it'll do for now
        map.setCollisionBetween(0, 5, true, layer);
        map.setCollision([45,46,47], true, collectLayer);

        playerCollisionGroup        = game.physics.p2.createCollisionGroup();
        player2CollisionGroup       = game.physics.p2.createCollisionGroup();
        projectileCollisionGroup    = game.physics.p2.createCollisionGroup();
        projectileCollisionGroup2   = game.physics.p2.createCollisionGroup();
        gunCollisionGroup           = game.physics.p2.createCollisionGroup();
        wheelCollisionGroup         = game.physics.p2.createCollisionGroup();
        thrusterCollisionGroup      = game.physics.p2.createCollisionGroup();
        tilesCollisionGroup         = this.physics.p2.createCollisionGroup();
        collectCollisionGroup       = this.physics.p2.createCollisionGroup();

        game.physics.p2.updateBoundsCollisionGroup();

        robots.playerCollisionGroup         = playerCollisionGroup;
        robots.player2CollisionGroup        = player2CollisionGroup;
        robots.tilesCollisionGroup          = tilesCollisionGroup;
        robots.projectileCollisionGroup     = projectileCollisionGroup;
        robots.projectileCollisionGroup2    = projectileCollisionGroup2;
        robots.collectCollisionGroup        = collectCollisionGroup;
        // game.physics.p2.setBoundsToWorld(true, true, true, true, true);
        //game.physics.p2.setBounds(0, 0, 800, 600, true, true, true, true);

        /*

        //  The platforms group contains the ground and the ledges
        platforms = game.add.group();
        platforms.enableBody = true;

        // Here we create the ground.
        var ground = platforms.create(0, game.world.height - 8, 'ground');
        ground.scale.setTo(3, .2);
        ground.body.immovable = false;*/

        var slantedTiles = game.physics.p2.convertCollisionObjects(map, "Object Layer 1");

        slantedTiles.forEach(function (kyle) {
            kyle.setCollisionGroup(tilesCollisionGroup);
            kyle.collides([playerCollisionGroup, player2CollisionGroup, projectileCollisionGroup, projectileCollisionGroup2]);
        });

        /*var stars = game.add.group();
        stars.enableBody = true;
        stars.physicsBodyType = Phaser.Physics.P2JS;
        map.createFromObjects('Object Layer 1', 4, 'baddie', 0, true, false, stars);*/

        var starObjects = game.physics.p2.convertTilemap(map, collectLayer);
        console.log(starObjects[0]);
        starObjects.forEach(function (s) {
            s.setCollisionGroup(collectCollisionGroup);
            s.collides([playerCollisionGroup, player2CollisionGroup], function(a,b){
                //console.log(a);
                //game.physics.p2.removeBody(a);
            }, s);
            // s.animations.add('die', [0], 10, false);
            // s.animations.play('die', null, false, true);
        });
        
        
        /*tileObjects.forEach(function (t) {
            t.setCollisionGroup(tilesCollisionGroup);
            t.collides([playerCollisionGroup, player2CollisionGroup, projectileCollisionGroup, projectileCollisionGroup2]);
        });*/
        tileObjects = game.physics.p2.convertTilemap(map, layer);
        robots.log(tileObjects.length);
        for (var i = 0; i < tileObjects.length; i++) {
            var tileBody = tileObjects[i];
            tileBody.setCollisionGroup(tilesCollisionGroup);
            tileBody.collides([playerCollisionGroup, player2CollisionGroup, projectileCollisionGroup, projectileCollisionGroup2]);
        }

        fire1 = game.add.sprite(270, game.world.height - 140 - 300, 'fire');
        fire2 = game.add.sprite(330, game.world.height - 140 - 300, 'fire');
        fire1.scale.setTo(.7);
        fire2.scale.setTo(.7);
        fire1.alpha = .8;
        fire2.alpha = .8;

        wheel1 = game.add.sprite(270, game.world.height - 10 - 300, 'wheel');
        wheel2 = game.add.sprite(295, game.world.height - 10 - 300, 'wheel');
        wheel1.scale.set(.04);
        wheel2.scale.set(.04);

        thruster1 = game.add.sprite(270, game.world.height - 150 - 300, 'thruster');
        thruster1.scale.setTo(.3, .3);
        thruster2 = game.add.sprite(330, game.world.height - 150 - 300, 'thruster');
        thruster2.scale.setTo(.3, .3);

        //badguy = game.add.sprite(300, game.world.height - 150, 'dude');
        //badguy.scale.setTo(1.2);
        badguy = game.add.sprite(300, game.world.height - 150 - 300, 'body2');
        badguy.scale.set(.08);

        mgun = game.add.sprite(300, game.world.height - 140 - 300, 'gun');
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
        wheel1.body.setCollisionGroup(player2CollisionGroup);
        wheel2.body.setCollisionGroup(player2CollisionGroup);
        wheel1.body.collides([tilesCollisionGroup, playerCollisionGroup, projectileCollisionGroup]);
        wheel2.body.collides([tilesCollisionGroup, playerCollisionGroup, projectileCollisionGroup]);

        thruster1.body.mass = 1;
        thruster2.body.mass = 1;
        thruster1.body.setCollisionGroup(player2CollisionGroup);
        thruster2.body.setCollisionGroup(player2CollisionGroup);
        thruster1.body.collides([tilesCollisionGroup, playerCollisionGroup, projectileCollisionGroup]);
        thruster2.body.collides([tilesCollisionGroup, playerCollisionGroup, projectileCollisionGroup]);

        badguy.body.setCircle(25);
        badguy.body.fixedRotation = false;
        badguy.body.mass = PLAYER_MASS;
        badguy.body.damping = PLAYER_DAMPING;
        badguy.body.data.gravityScale = 1;
        badguy.body.setCollisionGroup(player2CollisionGroup);
        badguy.body.collides([tilesCollisionGroup, playerCollisionGroup, projectileCollisionGroup]);

        mgun.body.setCollisionGroup(player2CollisionGroup);
        mgun.body.collides([tilesCollisionGroup, playerCollisionGroup, projectileCollisionGroup]);
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
        var g = game.add.existing(new parts.Chaingun({ x: 2, y: 0 }, b, bodyPos, parts.BULLET_TYPE));
        var w1 = game.add.existing(new parts.Wheel({ x: 2, y: 3 }, b, bodyPos, { movesRight: true }));
        var w2 = game.add.existing(new parts.Wheel({ x: 3, y: 3 }, b, bodyPos, { movesRight: true }));
        var w3 = game.add.existing(new parts.Wheel({ x: 1, y: 3 }, b, bodyPos, { movesLeft: true }));
        var w4 = game.add.existing(new parts.Wheel({ x: 0, y: 3 }, b, bodyPos, { movesLeft: true }));
        //var w5 = game.add.existing(new parts.Wheel({ x: 4, y: 3 }, b, bodyPos));
        var t1 = game.add.existing(new parts.Thruster({ x: 3, y: 1}, b, bodyPos));
        var t2 = game.add.existing(new parts.Thruster({ x: 0, y: 1}, b, bodyPos));
        //game.camera.follow(b);

    };

    var Projectile = function (x, y, sprite, gun, scale, mainPlayer) {
        this._acceleration = 0;
        this._speed = 0;
        this.collideCallback = this.collideCallback || function (a, b) { a.destroy(); };

        Phaser.Sprite.call(this, game, x, y, sprite);
        this.scale.setTo(scale[0], scale[1]);
        //Phaser.SpriteBatch.call(this, game, bullets, 'bullet', true)
        //this.bully = bullets.getFirstDead.call(this);
        //this.bully.reset(x, y);
        //game.physics.p2.

        this.anchor.setTo(.5, .5);

        game.physics.p2.enable(this, robots.DEBUG_MODE);
        this.body.data.gravityScale = 0;

        this.body.setCollisionGroup(mainPlayer ? projectileCollisionGroup : projectileCollisionGroup2);
        this.body.collides([tilesCollisionGroup, (!mainPlayer ? playerCollisionGroup : player2CollisionGroup)], this.collideCallback, this);
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

    var Rocket = function (x, y, gun, mainPlayer) {
        this.collideCallback = missleHit;
        Projectile.call(this, x, y, 'rocket', gun, [.15, .1], mainPlayer);
        //this.scale.setTo(.15, .1);
        //this.body.setCircle(15);
        this._acceleration = 1000;
        this.body.moveBackward(50);
    }
    robots.Rocket = Rocket;

    Rocket.prototype = Object.create(Projectile.prototype);
    Rocket.prototype.constructor = Rocket;

    var Bullet = function (x, y, gun, mainPlayer) {
        Projectile.call(this, x, y, 'bullet', gun, [.34, .34], mainPlayer);
        //this.scale.setTo(.34, .34);
        this._speed = 2000;
        //this._acceleration = 1200;
    }
    robots.Bullet = Bullet;

    Bullet.prototype = Object.create(Projectile.prototype);
    Bullet.prototype.constructor = Bullet;

    function missleHit(missile) {
        var exp = game.add.sprite(missile.x - 40, missile.y - 50, 'explosion');
        exp.scale.setTo(.5);
        exp.animations.add('boom', [0,1,2,3,4,5], 20, false);
        exp.animations.play('boom', null, false, true);
        robots.log('hit!');
        missile.destroy();
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

        hills.tilePosition.set(game.camera.x * -0.4, game.camera.y * -0.4)

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

        if (wasd.left.isDown) {
            //badguy.body.rotateLeft(180);
            //badguy.body.angle = 270;
            //badguy.body.moveLeft(MOVE_SPEED);
            //badguy.body.thrust(thrustSpeed);
            //badguy.animations.play('left');

            leftWheel.enableMotor();
            leftWheel.setMotorSpeed(MOTOR_SPEED);

            thruster1.body.angle = 270;
            thruster2.body.angle = 270;
            thruster1.body.thrust(thrustSpeed);
            thruster2.body.thrust(thrustSpeed);
        } else if (wasd.right.isDown) {
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

        if (wasd.up.isDown) {
            shouldAnimateFire = true;
            // badguy.body.angle = 0;
            badguy.body.moveUp(MOVE_SPEED);
            // badguy.body.thrust(thrustSpeed);

            thruster1.body.angle = 0;
            thruster1.body.thrust(thrustSpeed || THRUST_SPEED);
            thruster2.body.angle = 0;
            thruster2.body.thrust(thrustSpeed || THRUST_SPEED);
        } else if (wasd.down.isDown) {
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

        var mouseX = game.input.activePointer.x + game.camera.x;
        var mouseY = game.input.activePointer.y + game.camera.y;

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

        var title = 'use WASD or arrow keys to move - use mouse to aim and shoot';
        if (robots.DEBUG_MODE) title += ' [[ DEBUG MODE ]]';
        game.debug.text(title, 32, 32);
        //game.debug.text('Boost Energy: ' + boost_energy, 32, 50);

    }

})(robots);