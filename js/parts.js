parts = {};

(function (parts) {

    'use strict';
	
	parts = parts || {};

	var STARTING_X = 300, STARTING_Y = 0,
		PART_WIDTH = 64,  PART_HEIGHT = 64;

    var cursors;

    parts.BULLET_TYPE = Math.pow(2, 0);
    parts.ROCKET_TYPE = Math.pow(2, 1);

	var Part = function(spriteName, size, position, scale) {
        var x = position.x * PART_WIDTH + (size.width * PART_WIDTH / 2) + STARTING_X;
        var y = position.y * PART_HEIGHT + (size.height * PART_HEIGHT / 2) + STARTING_Y;

        robots.log(spriteName + ': ' + x + ', ' + y);
        
        Phaser.Sprite.call(this, game, x, y, spriteName);
        this.scale.setTo(scale.x, scale.y);

        this.collisionGroup = robots.playerCollisionGroup;
        this.collidesWith = [robots.player2CollisionGroup, robots.tilesCollisionGroup, robots.projectileCollisionGroup2];
        //this.collisionGroup = parts.playerCollisionGroup || 
        //    (parts.playerCollisionGroup = game.physics.p2.createCollisionGroup());
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

    var Body1 = function(position) {
        var size = { height: 2, width: 2 };
        var scale = { x: .08, y: .08 };

        Part.call(this, 'body2', size, position, scale);

        game.physics.p2.enable(this, robots.DEBUG_MODE);

        this.body.setCircle(25);
        this.body.fixedRotation = false;
        this.body.mass = .5;
        this.body.damping = .2;
        this.body.data.gravityScale = 1;
        this.body.setCollisionGroup(this.collisionGroup);
        this.body.collides(this.collidesWith);
        this.body.collideWorldBounds = false;
        this.body.outOfBoundsKill = true;
    };
    parts.Body1 = Body1;

    Body1.prototype = Object.create(Part.prototype);
    Body1.prototype.constructor = Body1;

    var Thruster = function(position, body, bodyPos) {
        var size = { height: 1, width: 2 };
        var scale = { x: .3, y: .3 };

        this.axe = 7000;

        this.updateCallback = function () {
            //cursors = cursors || game.input.keyboard.createCursorKeys();
            var shouldAnim = false;

            if (robots.cursors.up.isDown) { //|| robots.wasd.up.isDown) {
                this.body.thrust(this.axe);
                shouldAnim = true;
            } else if (robots.cursors.down.isDown) { //|| robots.wasd.down.isDown) {
                this.body.reverse(this.axe);
                shouldAnim = true;
            }

            if (robots.cursors.right.isDown) {
                this.body.rotateRight(90);
                robots.log('stuff');
            }
            if (shouldAnim) this.fire.animations.play('on');
            else this.fire.animations.play('off');
        };

        Part.call(this, 'thruster', size, position, scale);

        game.physics.p2.enable(this, robots.DEBUG_MODE);

        this.body.mass = .5;
        this.body.data.gravityScale = 1;
        this.body.setCollisionGroup(this.collisionGroup);
        this.body.collides(this.collidesWith);

        this.group = this.game.add.group(this);
        this.fire = this.group.create(-this.width, this.height/2, 'fire');
        this.fire.scale.setTo(1.5);
        this.fire.animations.add('on', [5, 4, 3, 2, 1, 0, 1, 2, 3, 4], 15, true);
        this.fire.animations.add('off', [10, 9, 8, 7, 6, 7, 8, 9], 5, true);
        //this.addChild(fire1);
        //this.addChild(fire2);

        var cx = (bodyPos.x - position.x) * PART_WIDTH/2;
        var cy = (bodyPos.y - position.y) * PART_HEIGHT/2;
        game.physics.p2.createLockConstraint(body, this, [cx, cy], 0, this.max_force);
    };
    parts.Thruster = Thruster;

    Thruster.prototype = Object.create(Part.prototype);
    Thruster.prototype.constructor = Thruster;

    var Wheel = function(position, body, bodyPos, options) {
        var size = { height: 1, width: 1 };
        var scale = { x: .04, y: .04 };

        this.options = options;
        this.motor_speed = 30;

        this.updateCallback = function () {
            if (robots.cursors.right.isDown) { //|| robots.wasd.right.isDown) {
                if (this.options.movesRight) {
                    this.constraint.enableMotor();
                    this.constraint.setMotorSpeed(-this.motor_speed);
                }
            } else if (robots.cursors.left.isDown) {// || robots.wasd.left.isDown) {
                if (this.options.movesLeft) {
                    this.constraint.enableMotor();
                    this.constraint.setMotorSpeed(this.motor_speed);
                }
            } else {
                this.constraint.disableMotor();
            }
        };

        Part.call(this, 'wheel', size, position, scale);

        game.physics.p2.enable(this, robots.DEBUG_MODE);

        this.body.mass = 1;
        this.body.setCircle(18);
        this.body.setCollisionGroup(this.collisionGroup);
        this.body.collides(this.collidesWith);

        var cx = (position.x - bodyPos.x) * PART_WIDTH/2;
        var cy = (position.y - bodyPos.y) * PART_HEIGHT/2;
        this.constraint = game.physics.p2.createRevoluteConstraint(
            body, [cx, cy], this, [0, 0], this.max_force);
    };
    parts.Wheel = Wheel;

    Wheel.prototype = Object.create(Part.prototype);
    Wheel.prototype.constructor = Wheel;

    var Chaingun = function(position, body, bodyPos, projectileType) {
        var size = { height: 1, width: 2 };
        var scale = { x: .2, y: .2 };

        this.lastFire = 0;
        if (projectileType === parts.BULLET_TYPE) this.fireRate = 80;
        if (projectileType === parts.ROCKET_TYPE) this.fireRate = 500;

        this.updateCallback = function () {
            var mouseX = game.input.activePointer.x + game.camera.x;
            var mouseY = game.input.activePointer.y + game.camera.y;

            this.body.rotation = game.math.angleBetween(this.body.x, this.body.y, mouseX, mouseY);

            if (game.input.activePointer.isDown) {
                if (projectileType === parts.ROCKET_TYPE) {
                    if (game.time.now > this.lastFire + this.fireRate) {
                        this.lastFire = game.time.now;
                        var newR = game.add.existing(new robots.Rocket(this.body.x, this.body.y, this, true));
                    }
                } else if (projectileType === parts.BULLET_TYPE) {
                    if (game.time.now > this.lastFire + this.fireRate) {
                        this.lastFire = game.time.now;
                        var newB = game.add.existing(new robots.Bullet(this.body.x, this.body.y, this, true));
                    }
                }
            }
        };

        Part.call(this, 'gun', size, position, scale);

        game.physics.p2.enable(this, robots.DEBUG_MODE);

        this.body.mass = 1.5;
        this.body.data.gravityScale = 0;
        this.body.setCollisionGroup(this.collisionGroup);
        this.body.collides(this.collidesWith);

        var cx = (bodyPos.x - position.x) * PART_WIDTH/2;
        var cy = (bodyPos.y - position.y) * PART_HEIGHT/2;
        game.physics.p2.createLockConstraint(body, this, [cx, cy], 0, this.max_force);
    };
    parts.Chaingun = Chaingun;

    Chaingun.prototype = Object.create(Part.prototype);
    Chaingun.prototype.constructor = Chaingun;

    parts.init = function () {
        
    }

})(parts);