
module robots {

    'use strict';

    export var DEBUG_MODE = true;

    export var log = function (msg) {

        if (robots.DEBUG_MODE) {
            // console.debug('%cROBOT DEBUG: ' + msg, 'color: #0F0; background: #000');
            util.debugMsg(msg, false);
        }

    }

    export var player;

    export var cursors, wasd;

    export var playerCollisionGroup, player2CollisionGroup, gunCollisionGroup, wheelCollisionGroup,
        projectileCollisionGroup, projectileCollisionGroup2, thrusterCollisionGroup,
        tilesCollisionGroup, collectCollisionGroup;

    var platforms, bullets, hills, skyline;

    export class Robotics extends Phaser.State {

        constructor() {

            super();
            robots.log('Arena state.');
            robots.log('[[ DEBUG MODE IS ON ]]');

        }

        create() {

            this.game.physics.startSystem(Phaser.Physics.P2JS);
            this.game.physics.p2.setImpactEvents(true); //  Turn on impact events for the world; without this we get no collision callbacks
            this.game.physics.p2.gravity.y = 1500; // Picked arbirary number
            this.game.physics.p2.restitution = 0; // Default value for collision 'bouncing'
            this.game.physics.p2.friction = 200;
            
            this.setAllCollisionGroups();
            this.buildMap();
            this.buildInputs();
            this.buildCharacters();

            //this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);
            //this.game.physics.p2.setBounds(0, 0, 800, 640, true, true, true, false);

            /*  The platforms group contains the ground and the ledges
            platforms = this.game.add.group();
            platforms.enableBody = true;

            // Here we create the ground.
            var ground = platforms.create(0, this.game.world.height - 8, 'ground');
            ground.scale.setTo(3, .2);
            ground.body.immovable = false;*/

            /* var playBot = [
                { type: parts.GUN_TYPE, position: { x: 2, y: 0 }, options: { projectileType: parts.ROCKET_TYPE } },
                { type: parts.WHEEL_TYPE, position: { x: 0, y: 3 }, options: { movesRight: true } },
                { type: parts.WHEEL_TYPE, position: { x: 1, y: 3 }, options: { movesRight: true } },
                { type: parts.WHEEL_TYPE, position: { x: 2, y: 3 }, options: { movesLeft: true } },
                { type: parts.WHEEL_TYPE, position: { x: 3, y: 3 }, options: { movesLeft: true } },
                { type: parts.THRUSTER_TYPE, position: { x: 0, y: 1 }, options: { fixed: true } },
                { type: parts.THRUSTER_TYPE, position: { x: 3, y: 1 }, options: { fixed: true } }
            ];

            var player = parts.buildABot(playBot); */

        }

        update() {

            skyline.tilePosition.set(this.game.camera.x * -0.5, this.game.camera.y * -0.5);

        }

        render() {

            var title = 'use WASD or arrow keys to move - use mouse to aim and shoot';
            if (robots.DEBUG_MODE) title += ' [[ DEBUG MODE ]]';
            this.game.debug.text(title, 32, 32, '#EE00CC');
            //this.game.debug.text('Boost Energy: ' + boost_energy, 32, 50);

        }

        buildCharacters() {

            if (localStorage.getItem('useDefault') === 'true' || !localStorage.getItem('partList')) {

                this.buildOldBot();

            } else {

                var partList = JSON.parse(localStorage.getItem('partList'));
                player = parts.buildABot(partList);
                this.game.camera.follow(player.body);

            }

            log(NPC);
            var drone = new NPC(700, 300, 'drone');

        }

        buildInputs() {

            cursors = this.game.input.keyboard.createCursorKeys();
            // cursors.space = this.game.input.keyboard.addKey(32);
            cursors.space = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

            wasd = {
                up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
                down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
                left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
                right: this.game.input.keyboard.addKey(Phaser.Keyboard.D)
            };

        }

        buildMap() {

            this.game.stage.backgroundColor = '#2d2d2d';

            var sky = this.game.add.sprite(0, 0, 'sky');
            sky.scale.set(14, 1);

            var stars = this.game.add.tileSprite(0, 0, 640, 800, 'stars');
            stars.scale.set(1.25, 1.57);
            stars.fixedToCamera = true;

            //var hills = this.game.add.sprite(0, 0, 'hills');
            //hills = this.game.add.tileSprite(0, 0, 1956, 640, 'hills');
            // hills.fixedToCamera = true;
            //var hills2 = this.game.add.tileSprite(1956, 0, 1956, 640, 'hills');

            skyline = this.game.add.tileSprite(0, 0, 1988, 640, 'skyline');
            skyline.scale.setTo(1.5, 1);
            skyline.fixedToCamera = true;

            var map = this.game.add.tilemap('map', 16, 16);
            map.addTilesetImage('tileset');
            map.addTilesetImage('mario_star');
            map.addTilesetImage('slanted');
            map.addTilesetImage('slantless');

            var layer = map.createLayer('Tile Layer 1');
            var collectLayer = map.createLayer('Collect Layer');
            var otherLayer = map.createLayer('Other Layer');

            layer.resizeWorld();

            var tileObjects = this.game.physics.p2.convertTilemap(map, layer);

            map.setCollisionBetween(0, 5, true, layer);
            map.setCollision([45, 46, 47], true, collectLayer);

            var slantedTiles = this.game.physics.p2.convertCollisionObjects(map, "Object Layer 1");

            slantedTiles.forEach(function (kyle) {
                kyle.setCollisionGroup(tilesCollisionGroup);
                kyle.collides([playerCollisionGroup, player2CollisionGroup, projectileCollisionGroup, projectileCollisionGroup2]);
            });

            /*var stars = this.game.add.group();
            stars.enableBody = true;
            stars.physicsBodyType = Phaser.Physics.P2JS;
            map.createFromObjects('Object Layer 1', 4, 'baddie', 0, true, false, stars);*/

            var starObjects = this.game.physics.p2.convertTilemap(map, collectLayer);

            starObjects.forEach(function (s) {
                s.setCollisionGroup(collectCollisionGroup);
                s.collides([playerCollisionGroup, player2CollisionGroup], function (a, b) {
                    //console.log(a);
                    //this.game.physics.p2.removeBody(a);
                }, s);
                // s.animations.add('die', [0], 10, false);
                // s.animations.play('die', null, false, true);
            });


            /*tileObjects.forEach(function (t) {
                t.setCollisionGroup(tilesCollisionGroup);
                t.collides([playerCollisionGroup, player2CollisionGroup, projectileCollisionGroup, projectileCollisionGroup2]);
            });*/

            tileObjects = this.game.physics.p2.convertTilemap(map, layer);
            robots.log(tileObjects.length);

            for (var i = 0; i < tileObjects.length; i++) {
                var tileBody = tileObjects[i];
                tileBody.setCollisionGroup(tilesCollisionGroup);
                tileBody.collides([playerCollisionGroup, player2CollisionGroup, projectileCollisionGroup, projectileCollisionGroup2]);
            }

        }

        setAllCollisionGroups() {

            var allCollisionGroups = [playerCollisionGroup, player2CollisionGroup, projectileCollisionGroup, projectileCollisionGroup2,
                                      gunCollisionGroup, wheelCollisionGroup];

            playerCollisionGroup = this.game.physics.p2.createCollisionGroup();
            player2CollisionGroup = this.game.physics.p2.createCollisionGroup();
            projectileCollisionGroup = this.game.physics.p2.createCollisionGroup();
            projectileCollisionGroup2 = this.game.physics.p2.createCollisionGroup();
            gunCollisionGroup = this.game.physics.p2.createCollisionGroup();
            wheelCollisionGroup = this.game.physics.p2.createCollisionGroup();
            thrusterCollisionGroup = this.game.physics.p2.createCollisionGroup();
            tilesCollisionGroup = this.game.physics.p2.createCollisionGroup();
            collectCollisionGroup = this.game.physics.p2.createCollisionGroup();
            npcCollisionGroup = this.game.physics.p2.createCollisionGroup();

            this.game.physics.p2.updateBoundsCollisionGroup();

        }

        buildOldBot() {

            var badguy, mgun, wheel1, wheel2, thruster1, thruster2, leftWheel, rightWheel, fire1, fire2;
            var constraint1, constraint2, constraint3;
            var ROCKET_LAUNCHER = 1,
                MACHINEGUN = 2,
                selectedGun = ROCKET_LAUNCHER;
            var PLAYER_MASS = 2,
                PLAYER_DAMPING = .1;//.8;
            var ROCKET_FIRE_RATE = 400,
                MACHINE_FIRE_RATE = 70;
            var MAX_FORCE = 20000;
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

            fire1 = this.game.add.sprite(270, this.game.world.height - 140 - 300, 'fire');
            fire2 = this.game.add.sprite(330, this.game.world.height - 140 - 300, 'fire');
            fire1.scale.setTo(.7);
            fire2.scale.setTo(.7);
            fire1.alpha = .8;
            fire2.alpha = .8;

            wheel1 = this.game.add.sprite(270, this.game.world.height - 10 - 300, 'wheel');
            wheel2 = this.game.add.sprite(295, this.game.world.height - 10 - 300, 'wheel');
            wheel1.scale.set(.04);
            wheel2.scale.set(.04);

            thruster1 = this.game.add.sprite(270, this.game.world.height - 150 - 300, 'thruster');
            thruster1.scale.setTo(.3, .3);
            thruster2 = this.game.add.sprite(330, this.game.world.height - 150 - 300, 'thruster');
            thruster2.scale.setTo(.3, .3);

            //badguy = this.game.add.sprite(300, this.game.world.height - 150, 'dude');
            //badguy.scale.setTo(1.2);
            badguy = this.game.add.sprite(300, this.game.world.height - 150 - 300, 'body2');
            badguy.scale.set(.08);

            mgun = this.game.add.sprite(300, this.game.world.height - 140 - 300, 'gun');
            mgun.scale.setTo(.2, .2);

            bullets = this.game.add.group();
            bullets.enableBody = true;
            bullets.physicsBodyType = Phaser.Physics.P2JS;
            bullets.createMultiple(50, 'bullet');
            /*for (var ctr=0; ctr<50; ctr++) {
                var bullet = bullets.create();
            }
            bullets.setAll('checkWorldBounds', true);
            bullets.setAll('outOfBoundsKill', true);*/

            this.game.physics.p2.enable([badguy, mgun, thruster1, thruster2], robots.DEBUG_MODE);
            this.game.physics.p2.enable([wheel1, wheel2], robots.DEBUG_MODE);
            this.game.camera.follow(badguy);

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

            constraint1 = this.game.physics.p2.createLockConstraint(badguy, mgun, [0, 30], 9, MAX_FORCE);
            constraint2 = this.game.physics.p2.createLockConstraint(badguy, thruster1, [35, 10], 0, MAX_FORCE);
            constraint3 = this.game.physics.p2.createLockConstraint(badguy, thruster2, [-35, 10], 0, MAX_FORCE);
            leftWheel = this.game.physics.p2.createRevoluteConstraint(badguy, [-(badguy.width / 2),
                badguy.height / 2], wheel1, [0, 0], MAX_FORCE);
            rightWheel = this.game.physics.p2.createRevoluteConstraint(badguy, [badguy.width / 2,
                badguy.height / 2], wheel2, [0, 0], MAX_FORCE);

            badguy.update = function update() {

                // badguy.body.setZeroVelocity();
                var thrustSpeed = 0;
                var shouldAnimateFire = false;
                leftWheel.setMotorSpeed(0);
                rightWheel.setMotorSpeed(0);
                leftWheel.disableMotor();
                rightWheel.disableMotor();
                if (boost_energy > BOOST_MAX_ENERGY) boost_energy = BOOST_MAX_ENERGY;
                if (cursors.space.isDown && boost_energy > 0) {
                    shouldAnimateFire = true;
                    thrustSpeed = BOOST_SPEED;
                    if (!robots.DEBUG_MODE) boost_energy -= BOOST_COST;
                } else if (boost_energy < BOOST_MAX_ENERGY) {
                    if (!boost_energy) {
                        if (cursors.space.isDown) {
                            boost_recharge_time = 0;
                        } else if (!boost_recharge_time) {
                            boost_recharge_time = this.game.time.now + BOOST_WAIT_TIME;
                        } else if (this.game.time.now > boost_recharge_time) {
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
                fire1.y = t1.y + t1.height / 2;
                fire2.x = t2.x;
                fire2.y = t2.y + t2.height / 2;

                if (shouldAnimateFire) {
                    fire1.animations.play('on');
                    fire2.animations.play('on');
                } else {
                    fire1.animations.play('off');
                    fire2.animations.play('off');
                }

                var mouseX = this.game.input.activePointer.x + this.game.camera.x;
                var mouseY = this.game.input.activePointer.y + this.game.camera.y;

                mgun.body.rotation = this.game.math.angleBetween(mgun.body.x, mgun.body.y, mouseX, mouseY);

                if (this.game.input.activePointer.isDown) {
                    if (selectedGun === ROCKET_LAUNCHER) {
                        if (this.game.time.now > lastFire + ROCKET_FIRE_RATE) {
                            lastFire = this.game.time.now;
                            var newR = this.game.add.existing(new parts.Rocket(mgun.body.x, mgun.body.y, mgun));
                        }
                    } else if (selectedGun === MACHINEGUN) {
                        if (this.game.time.now > lastFire + MACHINE_FIRE_RATE) {
                            lastFire = this.game.time.now;
                            var newB = this.game.add.existing(new parts.Bullet(mgun.body.x, mgun.body.y, mgun));
                        }
                    }
                }

            }

        }

    }

}
