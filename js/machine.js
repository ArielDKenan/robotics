machine = {};

(function (machine) {

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var platforms, stars, scoreText, score = 0;

function preload() {

    //game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.image('gun', 'assets/machinegun.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('baddie', 'assets/baddie.png', 32, 32);
}

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    //game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');
    badguy = game.add.sprite(300, game.world.height - 150, 'baddie');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);
    game.physics.arcade.enable(badguy);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = .1;
    player.body.gravity.y = 600;
    player.body.collideWorldBounds = true;
    badguy.body.bounce.y = .2;
    badguy.body.gravity.y = 1000;
    badguy.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [3, 2, 1, 0], 10, true);
    player.animations.add('right', [8, 7, 6, 5], 10, true);
    badguy.animations.add('left', [0, 1], 7, true);
    badguy.animations.add('right', [2, 3], 7, true);
    badguy.animations.add('still', [1, 2], 2, true);

    badguy.xacc = 0;

    stars = game.add.group();

    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 23; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create((i%12) * 70, 2, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 160;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    cursors = game.input.keyboard.createCursorKeys();
}

function collectStar(player, star) {
    star.kill();
    score += 10;
    scoreText.text = 'Score: ' + score;
}

function update() {
    game.physics.arcade.collide(badguy, platforms);
    game.physics.arcade.collide(badguy, player);
    game.physics.arcade.collide(badguy, stars);
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.collide(stars, stars);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;
        player.animations.play('left');

	//badguy.body.velocity.x = -250;
	//badguy.animations.play('left');
	badguy.xacc = -50;
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;
        player.animations.play('right');

	//badguy.body.velocity.x = 250;
        //badguy.animations.play('right');
	badguy.xacc = 50;
    }
    else
    {
        //  Stand still
        player.animations.stop();
        player.frame = 4;

	badguy.body.velocity.x = 0;
	badguy.animations.play('still');

	
    }

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown)// && player.body.touching.down)
    {
        player.body.velocity.y = -220;
	badguy.body.velocity.y = -400;
    }else if (cursors.down.isDown && !player.body.touching.down) {
	//player.body.velocity.y += 100;
	player.body.velocity.y = 1500;
	player.body.bounce.y = 0;
    } else {
	player.body.bounce.y = 0;
    }
}

})(machine);