
;var robots = window.robots = window.robots || {};

!function (robots) {

    'use strict';

    var parts = {};
    robots.parts = parts;
    parts.game = window.game;

    /*********************************
     *            GLOBALS            *
     *********************************/

    var STARTING_X = 300, STARTING_Y = 0,
        PART_WIDTH = 45,  PART_HEIGHT = 45;
    var DAMPING_FACTOR = .5;

    var cursors;

    parts.BULLET_TYPE = Math.pow(2, 0);
    parts.ROCKET_TYPE = Math.pow(2, 1);

    parts.BODY_TYPE = Math.pow(2, 0);
    parts.GUN_TYPE = Math.pow(2, 1);
    parts.WHEEL_TYPE = Math.pow(2, 2);
    parts.THRUSTER_TYPE = Math.pow(2, 3);

    /*********************************
     *         CALCULATIONS          *
     *********************************/

    /* Calculate constraint positioning */
    var calcCXY = function (body1, body2) {

        var cx = (body2.x - body1.x) * PART_WIDTH/2,
            cy = (body2.y - body1.y) * PART_HEIGHT/2;

        if (cx !== cx || cy !== cy) {
            throw new Error("calcCXY(): failed to calculate something that would have prevented you wasting a lot of time");
        }
        
        return { cx: cx, cy: cy };

    };

    parts.buildABot = function (partList) {

        var _this = this;
        var b = game.add.existing(new parts.Body1({x:1, y:1}));

        partList.forEach(function (p) {

            var construct;

            if (p.type === parts.GUN_TYPE) construct = Chaingun;
            else if (p.type === parts.WHEEL_TYPE) construct = Wheel;
            else if (p.type === parts.THRUSTER_TYPE) construct = Thruster;

            game.add.existing(new construct(p.position, b, { x: 1, y: 1 }, p.options));

        });

        return b;

    }

    var touchingDown = function (someone) {

        var yAxis = game.physics.p2.vec2.fromValues(0, 1);
        var result = false;

        for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++) {

            var c = game.physics.p2.world.narrowphase.contactEquations[i];  // cycles through all the contactEquations until it finds our "someone"

            if (c.bodyA === someone.body.data || c.bodyB === someone.body.data) {
                var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis

                if (c.bodyA === someone.body.data) d *= -1;
                if (d > 0.5) result = true;
            }

        }

        return result;
        
    };

    /*********************************
     *        PART CONSTRUCTOR       *
     *********************************/

    var Part = function (spriteName, size, position, scale) {

        this.game = window.game;

        var x = position.x * PART_WIDTH + (size.width * PART_WIDTH / 2) + STARTING_X;
        var y = position.y * PART_HEIGHT + (size.height * PART_HEIGHT / 2) + STARTING_Y;

        robots.log(spriteName + ': ' + x + ', ' + y);
        
        Phaser.Sprite.call(this, game, x, y, spriteName);

        this.scale.setTo(scale.x, scale.y);

        this.collisionGroup = robots.playerCollisionGroup;
        this.collidesWith = [robots.player2CollisionGroup, robots.tilesCollisionGroup, robots.projectileCollisionGroup2];

        this.collectCallback = function (player, star) {

            //star.destroy();
            robots.log('got one');

        };

        this.max_force = 2000;

    };
    parts.Part = Part;

    Part.prototype = Object.create(Phaser.Sprite.prototype);
    Part.prototype.constructor = Part;

    Part.prototype.update = function() {

        if (this.updateCallback) {
            this.updateCallback();
        }

    };

    /***********************************
     *             PARTS               *
     ***********************************/

    var Body1 = function(position) {

        var size = { height: 2, width: 2 };
        var scale = { x: .1, y: .1 };

        Part.call(this, 'body2', size, position, scale);

        game.physics.p2.enable(this, robots.DEBUG_MODE);

        this.body.setCircle(25);
        this.body.fixedRotation = false;
        this.body.mass = .5;
        this.body.damping = DAMPING_FACTOR;
        this.body.data.gravityScale = 1;

        this.body.setCollisionGroup(this.collisionGroup);
        this.body.collides(this.collidesWith);
        this.body.collides(robots.collectCollisionGroup, this.collectCallback, this);

        this.body.collideWorldBounds = false;
        this.body.outOfBoundsKill = true;

    };
    parts.Body1 = Body1;

    Body1.prototype = Object.create(Part.prototype);
    Body1.prototype.constructor = Body1;

    var Thruster = function(position, body, bodyPos, options) {

        this.playerBody = body;
        this.fixed = options ? options.fixed : false;

        var size = { height: 1, width: 1 };
        var scale = { x: .25, y: .25 };

        this.axe = 7000;
        this.haxe = 5000;

        Part.call(this, 'thruster', size, position, scale);

        game.physics.p2.enable(this, robots.DEBUG_MODE);

        this.body.mass = .5;
        this.body.data.gravityScale = 1;
        this.body.damping = DAMPING_FACTOR;
        this.body.setCollisionGroup(this.collisionGroup);
        this.body.collides(this.collidesWith);
        this.body.collides(robots.collectCollisionGroup, this.collectCallback, this);

        this.group = this.game.add.group(this);
        this.fire = this.group.create(-this.width, this.height/2, 'fire');
        this.fire.scale.setTo(1.5);
        this.fire.animations.add('on', [5, 4, 3, 2, 1, 0, 1, 2, 3, 4], 15, true);
        this.fire.animations.add('off', [10, 9, 8, 7, 6, 7, 8, 9], 5, true);
        //this.addChild(fire1);
        //this.addChild(fire2);

        var cxy = calcCXY(position, bodyPos);
        game.physics.p2.createLockConstraint(body, this, [cxy.cx, cxy.cy], 0, this.max_force);

    };
    parts.Thruster = Thruster;

    Thruster.prototype = Object.create(Part.prototype);
    Thruster.prototype.constructor = Thruster;

    Thruster.prototype.updateCallback = function () {

        var shouldAnim = false;
        
        if (robots.cursors.up.isDown || robots.wasd.up.isDown) {

            this.body.angle = this.fixed ? this.playerBody.angle : 0;
            this.body.thrust(this.axe);
            shouldAnim = true;

        } else if (robots.cursors.down.isDown || robots.wasd.down.isDown) {

            this.body.angle = this.fixed ? this.playerBody.angle + 180 : 180;
            this.body.thrust(this.axe);
            shouldAnim = true;

        }

        if (robots.cursors.space.isDown) {

            if (robots.cursors.right.isDown || robots.wasd.right.isDown) {

                this.body.angle = this.fixed ? this.playerBody.angle + 90 : 90;
                this.body.thrust(this.haxe);
                shouldAnim = true;

            } else if (robots.cursors.left.isDown || robots.wasd.left.isDown) {

                this.body.angle = this.fixed ? this.playerBody.angle - 90 : 270;
                this.body.thrust(this.haxe);
                shouldAnim = true; 

            }

        }

        if (shouldAnim) this.fire.animations.play('on');
        else this.fire.animations.play('off');

    };

    var Wheel = function(position, body, bodyPos, options) {

        var size = { height: 1, width: 1 };
        var scale = { x: .04, y: .04 };

        this.options = options || { movesRight: true, movesLeft: true };
        this.motor_speed = 30;

        Part.call(this, 'wheel', size, position, scale);

        game.physics.p2.enable(this, robots.DEBUG_MODE);

        this.body.mass = 1;
        this.body.damping = DAMPING_FACTOR;
        this.body.setCircle(18);
        this.body.setCollisionGroup(this.collisionGroup);
        this.body.collides(this.collidesWith);
        this.body.collides(robots.collectCollisionGroup, this.collectCallback, this);

        var cxy = calcCXY(bodyPos, position);
        var cx = cxy.cx, cy = cxy.cy;
        this.constraint = game.physics.p2.createRevoluteConstraint(
            body, [cx, cy], this, [0, 0], this.max_force);

    };
    parts.Wheel = Wheel;

    Wheel.prototype = Object.create(Part.prototype);
    Wheel.prototype.constructor = Wheel;

    Wheel.prototype.updateCallback = function () {

        if (robots.cursors.right.isDown || robots.wasd.right.isDown) {

            if (this.options.movesRight) {
                this.constraint.enableMotor();
                this.constraint.setMotorSpeed(-this.motor_speed);
            }

        } else if (robots.cursors.left.isDown || robots.wasd.left.isDown) {

            if (this.options.movesLeft) {
                this.constraint.enableMotor();
                this.constraint.setMotorSpeed(this.motor_speed);
            }

        } else {

            this.constraint.disableMotor();

        }

    };

    var Chaingun = function(position, body, bodyPos, options) {

        var size = { height: 1, width: 2 };
        var scale = { x: .2, y: .2 };

        this.lastFire = 0;
        this.projectileType = options ? options.projectileType : parts.ROCKET_TYPE;
        if (this.projectileType === parts.BULLET_TYPE) this.fireRate = 80;
        else if (this.projectileType === parts.ROCKET_TYPE) this.fireRate = 500;

        Part.call(this, 'gun', size, position, scale);

        game.physics.p2.enable(this, robots.DEBUG_MODE);

        this.body.mass = 1.5;
        this.body.damping = DAMPING_FACTOR;
        this.body.data.gravityScale = 0;
        this.body.setCollisionGroup(this.collisionGroup);
        this.body.collides(this.collidesWith);
        this.body.collides(robots.collectCollisionGroup, this.collectCallback, this);

        var cxy = calcCXY(position, bodyPos);
        var cx = cxy.cx, cy = cxy.cy;
        game.physics.p2.createLockConstraint(body, this, [cx, cy], 0, this.max_force);

    };
    parts.Chaingun = Chaingun;

    Chaingun.prototype = Object.create(Part.prototype);
    Chaingun.prototype.constructor = Chaingun;

    Chaingun.prototype.updateCallback = function () {

        var mouseX = game.input.activePointer.x + game.camera.x;
        var mouseY = game.input.activePointer.y + game.camera.y;

        this.body.rotation = game.math.angleBetween(this.body.x, this.body.y, mouseX, mouseY);

        if (game.input.activePointer.isDown) {

            if (this.projectileType === parts.ROCKET_TYPE) {
                if (game.time.now > this.lastFire + this.fireRate) {
                    this.lastFire = game.time.now;
                    var newR = game.add.existing(new parts.Rocket(this.body.x, this.body.y, this, true));
                }

            } else if (this.projectileType === parts.BULLET_TYPE) {

                if (game.time.now > this.lastFire + this.fireRate) {
                    this.lastFire = game.time.now;
                    var newB = game.add.existing(new parts.Bullet(this.body.x, this.body.y, this, true));
                }
                
            }
        }

    };

    /***********************************
     *          PROJECTILES            *
     ***********************************/

    var Projectile = function (x, y, sprite, gun, scale, mainPlayer) {

        this._acceleration = 0;
        this._speed = 0;
        this.collideCallback = this.collideCallback || function (a, b) { if (a && a.destroy) a.destroy(); };

        Phaser.Sprite.call(this, game, x, y, sprite);
        this.scale.setTo(scale[0], scale[1]);
        //Phaser.SpriteBatch.call(this, game, bullets, 'bullet', true)
        //this.bully = bullets.getFirstDead.call(this);
        //this.bully.reset(x, y);
        //game.physics.p2.

        this.anchor.setTo(.5, .5);

        game.physics.p2.enable(this, robots.DEBUG_MODE);
        this.body.data.gravityScale = 0;

        var mainPlayer = true;
        this.body.setCollisionGroup(mainPlayer ? robots.projectileCollisionGroup : robots.projectileCollisionGroup2);
        this.body.collides([robots.tilesCollisionGroup, (!mainPlayer ? robots.playerCollisionGroup : robots.player2CollisionGroup)], this.collideCallback, this);
        this.body.collideWorldBounds = false;
        this.body.outOfBoundsKill = true;

        this.body.maintainAngle = gun.body.angle - 90;
        this.body.angle = this.body.maintainAngle;
        this.fixedRotate = true;

    };
    parts.Projectile = Projectile;

    Projectile.prototype = Object.create(Phaser.Sprite.prototype);
    Projectile.prototype.constructor = Projectile;

    Projectile.prototype.update = function() {

        if (this.body) {
            if (this.fixedRotate) this.body.angle = this.body.maintainAngle;
            if (this._speed) this.body.moveBackward(this._speed);
            if (this._acceleration) this.body.reverse(this._acceleration);
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
    parts.Rocket = Rocket;

    Rocket.prototype = Object.create(Projectile.prototype);
    Rocket.prototype.constructor = Rocket;

    var Bullet = function (x, y, gun, mainPlayer) {

        Projectile.call(this, x, y, 'bullet', gun, [.34, .34], mainPlayer);
        //this.scale.setTo(.34, .34);
        this._speed = 2000;
        //this._acceleration = 1200;

    }
    parts.Bullet = Bullet;

    Bullet.prototype = Object.create(Projectile.prototype);
    Bullet.prototype.constructor = Bullet;

    function missleHit(missile) {

        var exp = game.add.sprite(missile.x - 40, missile.y - 50, 'explosion');
        exp.scale.setTo(.5);
        exp.animations.add('boom', [0,1,2,3,4,5], 20, false);
        exp.animations.play('boom', null, false, true);
        robots.log('hit!');
        if (missile.destroy) missile.destroy();

    }

}(window.robots = window.robots || {});
