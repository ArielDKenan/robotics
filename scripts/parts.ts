
module parts {

    'use strict';

    /*********************************
     *            GLOBALS            *
     *********************************/
    var STARTING_X = 300, STARTING_Y = 100,
        PART_WIDTH = 45,  PART_HEIGHT = 45,
        DAMPING_FACTOR = .5;

    export var ROCKET_TYPE = Math.pow(2, 0);
    export var BULLET_TYPE = Math.pow(2, 1);

    // export var selectedProjectile = ROCKET_TYPE;

    export var BODY_TYPE = Math.pow(2, 0);
    export var GUN_TYPE = Math.pow(2, 1);
    export var WHEEL_TYPE = Math.pow(2, 2);
    export var THRUSTER_TYPE = Math.pow(2, 3);

    export var motorSpeed = 30;

    /*********************************
     *         CALCULATIONS          *
     *********************************/

    /* Calculate constraint positioning */
    var calcCXY = function (body1, body2) {

        var cx = (body2.x - body1.x) * PART_WIDTH/2,
            cy = (body2.y - body1.y) * PART_HEIGHT/2;

        if (cx !== cx || cy !== cy) {
            throw new Error("calcCXY(): failed to calculate something that would have prevented wasting a lot of time");
        }
        
        return { cx: cx, cy: cy };

    };

    /* Takes a JSON of a robot model and builds it with Part classes */
    export function buildABot(partList: any[]): any {

        var b = game.add.existing(new parts.Body1({ x: 1, y: 1 }));
        var player = { body: <Phaser.Sprite>b, part: [], selectedProjectile: <Number>ROCKET_TYPE };

        partList.forEach(function (p) {

            var construct;

            if (p.type === parts.GUN_TYPE) construct = Chaingun;
            else if (p.type === parts.WHEEL_TYPE) construct = Wheel;
            else if (p.type === parts.THRUSTER_TYPE) construct = Thruster;

            player.part.push(game.add.existing(new construct(p.position, b, { x: 1, y: 1 }, p.options)));

        });

        return player;

    }

    /* Calculates if a body is touching the ground */
    var touchingDown = function (someone) {

        var yAxis = p2.vec2.fromValues(0, 1);
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

    export class Part extends Phaser.Sprite {

        collisionGroup: Phaser.Physics.P2.CollisionGroup;
        collidesWith: any;
        collectCallback: Function;
        max_force: number;
        updateCallback: Function;
        options: any;

        constructor(spriteName: string, size, position, scale) {

            var x = position.x * PART_WIDTH + (size.width * PART_WIDTH / 2) + STARTING_X;
            var y = position.y * PART_HEIGHT + (size.height * PART_HEIGHT / 2) + STARTING_Y;

            robots.log(spriteName + ': ' + x + ', ' + y);

            super(game, x, y, spriteName);

            this.scale.setTo(scale.x, scale.y);

            this.collisionGroup = robots.playerCollisionGroup;
            this.collidesWith = [robots.player2CollisionGroup, robots.tilesCollisionGroup, robots.projectileCollisionGroup2];

            this.collectCallback = function (player, star) {

                //star.destroy();
                robots.log('got one');

            };

            this.max_force = 2000;

        }

        update() {

            if (this.updateCallback) {
                this.updateCallback();
            }

        }

    }

    /***********************************
     *             PARTS               *
     ***********************************/

    export class Body1 extends Part {

        constructor(position) {

            var size = { height: 2, width: 2 };
            var scale = { x: .1, y: .1 };

            super('body2', size, position, scale);
            //this.rotation = 90;
            this.worldRotation = 2;

            this.game.physics.p2.enable(this, robots.DEBUG_MODE);

            this.body.setCircle(25);
            this.body.fixedRotation = false;
            //var bb = new Phaser.Sprite(game, 1, 1);
            //bb.rotation
            this.body.mass = .5;
            this.body.damping = DAMPING_FACTOR;
            this.body.data.gravityScale = 1;

            this.body.setCollisionGroup(this.collisionGroup);
            this.body.collides(this.collidesWith);
            this.body.collides(robots.collectCollisionGroup, this.collectCallback, this);

            this.body.collideWorldBounds = false;
            this.body.outOfBoundsKill = true;

        }

    }

    export class Thruster extends Part {

        playerBody: p2.Body;
        fixed: boolean;
        axe: number;
        haxe: number;
        group: Phaser.Group;
        fire: Phaser.Sprite;

        constructor(position, body, bodyPos, options) {

            var size = { height: 1, width: 1 };
            var scale = { x: .25, y: .25 };

            super('thruster', size, position, scale);

            this.game.physics.p2.enable(this, robots.DEBUG_MODE);

            this.playerBody = body;
            this.fixed = options ? options.fixed : false;

            this.axe = 7000;
            this.haxe = 5000;

            this.body.mass = .5;
            this.body.data.gravityScale = 1;
            this.body.damping = DAMPING_FACTOR;
            this.body.setCollisionGroup(this.collisionGroup);
            this.body.collides(this.collidesWith);
            this.body.collides(robots.collectCollisionGroup, this.collectCallback, this);

            this.group = this.game.add.group(this);
            this.fire = this.group.create(-this.width, this.height / 2, 'fire');
            this.fire.scale.setTo(1.5);
            this.fire.animations.add('on', [5, 4, 3, 2, 1, 0, 1, 2, 3, 4], 15, true);
            this.fire.animations.add('off', [10, 9, 8, 7, 6, 7, 8, 9], 5, true);
            //this.addChild(fire1);
            //this.addChild(fire2);

            var cxy = calcCXY(position, bodyPos);
            this.game.physics.p2.createLockConstraint(body, this, [cxy.cx, cxy.cy], 0, this.max_force);

        }

        update() {

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

                    if (this.fixed) {
                        this.body.angle = this.playerBody.angle;
                        this.body.thrustRight(this.haxe);
                    } else {
                        this.body.angle = 90;
                        this.body.thrust(this.haxe);
                    }

                    shouldAnim = true;

                } else if (robots.cursors.left.isDown || robots.wasd.left.isDown) {

                    if (this.fixed) {
                        this.body.angle = this.playerBody.angle;
                        this.body.thrustLeft(this.haxe);
                    } else {
                        this.body.angle = 270;
                        this.body.thrust(this.haxe);
                    }

                    shouldAnim = true;

                }

            }

            if (shouldAnim) this.fire.animations.play('on');
            else this.fire.animations.play('off');

        }

    } 

    export class Wheel extends Part {

        motor_speed: number;
        constraint: p2.RevoluteConstraint;

        constructor(position, body, bodyPos, options) {

            var size = { height: 1, width: 1 };
            var scale = { x: .04, y: .04 };

            super('wheel', size, position, scale);

            this.options = options || { movesRight: true, movesLeft: true };

            this.game.physics.p2.enable(this, robots.DEBUG_MODE);

            this.body.mass = 1;
            this.body.damping = DAMPING_FACTOR;
            this.body.setCircle(18);
            this.body.setCollisionGroup(this.collisionGroup);
            this.body.collides(this.collidesWith);
            this.body.collides(robots.collectCollisionGroup, this.collectCallback, this);

            var cxy = calcCXY(bodyPos, position);
            var cx = cxy.cx, cy = cxy.cy;
            this.constraint = this.game.physics.p2.createRevoluteConstraint(
                body, [cx, cy], this, [0, 0], this.max_force);

        }

       update() {

            // TODO: only enable motors if wheel speed < motor speed

            if (robots.cursors.right.isDown || robots.wasd.right.isDown) {

                if (this.options.movesRight) {
                    this.constraint.enableMotor();
                    this.constraint.setMotorSpeed(-parts.motorSpeed);
                }

            } else if (robots.cursors.left.isDown || robots.wasd.left.isDown) {

                if (this.options.movesLeft) {
                    this.constraint.enableMotor();
                    this.constraint.setMotorSpeed(parts.motorSpeed);
                }

            } else {

                this.constraint.disableMotor();

            }

        }

    }

    export class Chaingun extends Part {

        lastFire: number;
        projectileType: number;
        fireRate: number;

        constructor(position, body, bodyPos, options) {

            var size = { height: 1, width: 2 };
            var scale = { x: .2, y: .2 };

            super('gun', size, position, scale);

            this.lastFire = 0;
            this.projectileType = options ? options.projectileType : parts.ROCKET_TYPE;
            if (this.projectileType === parts.BULLET_TYPE) this.fireRate = 80;
            else if (this.projectileType === parts.ROCKET_TYPE) this.fireRate = 500;

            this.game.physics.p2.enable(this, robots.DEBUG_MODE);

            this.body.mass = 1.5;
            this.body.damping = DAMPING_FACTOR;
            this.body.data.gravityScale = 0;
            this.body.setCollisionGroup(this.collisionGroup);
            this.body.collides(this.collidesWith);
            this.body.collides(robots.collectCollisionGroup, this.collectCallback, this);

            var cxy = calcCXY(position, bodyPos);
            var cx = cxy.cx, cy = cxy.cy;
            this.game.physics.p2.createLockConstraint(body, this, [cx, cy], 0, this.max_force);

        }

        update() {

            var mouseX = this.game.input.activePointer.x + this.game.camera.x;
            var mouseY = this.game.input.activePointer.y + this.game.camera.y;
        
            this.body.rotation = Phaser.Math.angleBetween(this.body.x, this.body.y, mouseX, mouseY);

            if (robots.player.selectedProjectile == ROCKET_TYPE) {
                this.projectileType = ROCKET_TYPE;
                this.fireRate = 500;
            } else if (robots.player.selectedProjectile == BULLET_TYPE) {
                this.projectileType = BULLET_TYPE;
                this.fireRate = 80;
            }

            if (this.game.input.activePointer.isDown) {

                if (this.projectileType === parts.ROCKET_TYPE) {
                    if (this.game.time.now > this.lastFire + this.fireRate) {
                        this.lastFire = this.game.time.now;
                        var newR = this.game.add.existing(new parts.Rocket(this.body.x, this.body.y, this, true));
                    }

                } else if (this.projectileType === parts.BULLET_TYPE) {

                    if (this.game.time.now > this.lastFire + this.fireRate) {
                        this.lastFire = this.game.time.now;
                        var newB = this.game.add.existing(new parts.Bullet(this.body.x, this.body.y, this, true));
                    }
                
                }
            }

        }

    }

    

    /***********************************
     *          PROJECTILES            *
     ***********************************/

    export class Projectile extends Phaser.Sprite {

        _acceleration: number;
        _speed: number;
        fixedRotate: boolean;

        constructor(x, y, sprite, gun, scale, mainPlayer) {

            super(game, x, y, sprite);
            this.scale.setTo(scale[0], scale[1]);

            //Phaser.SpriteBatch.call(this, game, bullets, 'bullet', true)
            //this.bully = bullets.getFirstDead.call(this);
            //this.bully.reset(x, y);
            //game.physics.p2.

            this._acceleration = 0;
            this._speed = 0;

            this.game.physics.p2.enable(this, robots.DEBUG_MODE);

            this.body.data.gravityScale = 0;

            mainPlayer = true;
            this.body.setCollisionGroup(mainPlayer ? robots.projectileCollisionGroup : robots.projectileCollisionGroup2);
            this.body.collides([robots.tilesCollisionGroup, (!mainPlayer ? robots.playerCollisionGroup : robots.player2CollisionGroup)], this.collideCallback, this);
            this.body.collides(robots.npcCollisionGroup, (a, b) => {
                a.destroy();
                var exp = this.game.add.sprite(b.x, b.y, 'explosion');
                exp.scale.setTo(.8);
                exp.x -= exp.width / 2;
                exp.y -= exp.height / 2;
                exp.animations.add('boom', [0, 1, 2, 3, 4, 5], 20, false);
                exp.animations.play('boom', null, false, true);
                b.sprite.destroy(); // TODO: safeDestroy
            }, this);
            this.body.collideWorldBounds = false;
            this.body.outOfBoundsKill = true;

            this.fixedRotate = true;
            this.body.maintainAngle = gun.body.angle - 90;
            this.body.angle = this.body.maintainAngle;

        }

        collideCallback(a, b) { a && a.destroy && a.destroy(); }

        update() {

            if (this.body) {
                if (this.fixedRotate) this.body.angle = this.body.maintainAngle;
                if (this._speed) this.body.moveBackward(this._speed);
                if (this._acceleration) this.body.reverse(this._acceleration);
            } else if (this.destroy) {
                this.destroy();
            }

        }

    }

    export class Rocket extends Projectile {

        constructor(x, y, gun, mainPlayer?) {
            
            super(x, y, 'rocket', gun, [.15, .1], mainPlayer);
            //this.scale.setTo(.15, .1);
            //this.body.setCircle(15);
            this._acceleration = 1000;
            this.body.moveBackward(50);

        }

        collideCallback(missile) {

            var exp = this.game.add.sprite(missile.x - 40, missile.y - 50, 'explosion');
            exp.scale.setTo(.5);
            exp.animations.add('boom', [0, 1, 2, 3, 4, 5], 20, false);
            exp.animations.play('boom', null, false, true);
            if (missile.destroy) missile.destroy();

        }

    }

    export class Bullet extends Projectile {

        constructor(x, y, gun, mainPlayer?) {

            super(x, y, 'bullet', gun, [.34, .34], mainPlayer);
            //this.scale.setTo(.34, .34);
            this._speed = 1000;
            //this._acceleration = 1200;

        }

    }

}
