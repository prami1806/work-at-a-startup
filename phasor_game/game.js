


// This code is written by incorporating logic from OpenSource phaser.io examples

//Variables...
    var background;
    var enemies;
    var alien_bullets;
    var enemiesTotal = 0;
    var enemiesAlive = 0;
    var explosions;

    var logo;

    var currentSpeed = 0;
    var cursors;

    var bullets;
    var fireRate = 100;
    var nextFire = 0;
    
    var health=100;

var game = new Phaser.Game(1200, 650, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: GameInfo });

function preload () {

    game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    
    //Load Assets
    game.load.image('Player_ship', 'img/Player_Ship.png');
    game.load.image('enemy_ship', 'img/enemy_ship.png');
    game.load.image('logo', 'img/logo.png');
    game.load.image('bullet', 'img/bullet2.png');
    game.load.image('background_image', 'img/star_background.jpg');
    game.load.image('youwon', 'img/youwon.png');
    game.load.image('youlose', 'img/youlose.png');
    game.load.spritesheet('EnemyDestroyed', 'img/blast.png', 64, 64, 23);
    
}



function create () {
    game.world.setBounds(-1000, -1000, 2000, 2000); //Game World Limits
    
    background= game.add.tileSprite(0, 0, 2000, 2000, 'background_image');
    background.fixedToCamera = true;
    
    health = 100;
    
    space_ship = game.add.sprite(0.5, 0.5, 'Player_ship');
    space_ship.anchor.setTo(0.5, 0.5);

    
    game.physics.enable(space_ship, Phaser.Physics.ARCADE);
    space_ship.body.drag.set(0.2);
    space_ship.body.maxVelocity.setTo(400, 400);
    space_ship.body.collideWorldBounds = true;
    

    //  The aliens bullet group
    alien_bullets = game.add.group();
    alien_bullets.enableBody = true;
    alien_bullets.physicsBodyType = Phaser.Physics.ARCADE;
    alien_bullets.createMultiple(100, 'bullet');
    
    alien_bullets.setAll('anchor.x', 0.5);
    alien_bullets.setAll('anchor.y', 0.5);
    alien_bullets.setAll('outOfBoundsKill', true);
    alien_bullets.setAll('checkWorldBounds', true);

    //Function to make EnemyShip
    enemies = [];

    enemiesTotal = 35;
    enemiesAlive = 35;

    for (var i = 0; i < enemiesTotal; i++)
    {
        enemies.push(new EnemyShip(i, game, space_ship, alien_bullets));
    }

    

    //  Player bullet group
    player_bullets = game.add.group();
    player_bullets.enableBody = true;
    player_bullets.physicsBodyType = Phaser.Physics.ARCADE;
    player_bullets.createMultiple(30, 'bullet', 0, false);
    player_bullets.setAll('anchor.x', -0.5);
    player_bullets.setAll('anchor.y',0.5);
    player_bullets.setAll('outOfBoundsKill', true);
    player_bullets.setAll('checkWorldBounds', true);

    //  Explosion
    explosions = game.add.group();

    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'EnemyDestroyed', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('EnemyDestroyed');
    }

    space_ship.bringToTop();
    logo = game.add.sprite(10, 5, 'logo');
    logo.fixedToCamera = true;

    game.camera.follow(space_ship);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();
    spacekey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


}

function youwon () {
    gameover = game.add.sprite(game.camera.width / 2, game.camera.height / 2, 'youwon');
    gameover.anchor.setTo(0.5,0.5);
    gameover.fixedToCamera = true;
    if(spacekey.isDown)
    {
        health = 100;
        create();
    }

}
function youlose () {
    gameover = game.add.sprite(game.camera.width / 2, game.camera.height / 2, 'youlose');
    gameover.anchor.setTo(0.5,0.5);
    gameover.fixedToCamera = true;
    if(spacekey.isDown)
    {
        health = 100;
        create();
    }

}

function update () {

    game.physics.arcade.overlap(alien_bullets, space_ship, bulletHitPlayer, null, this);

    enemiesAlive = 0;

    for (var i = 0; i < enemies.length; i++)
    {
        if (enemies[i].alive)
        {
            enemiesAlive++;
            game.physics.arcade.collide(space_ship, enemies[i].space_ship);
            game.physics.arcade.overlap(player_bullets, enemies[i].space_ship, bulletHitEnemy, null, this);
            enemies[i].update();
        }
    }

    if (cursors.left.isDown)
    {
        space_ship.angle -= 4;
    }
    else if (cursors.right.isDown)
    {
        space_ship.angle += 4;
    }

    if (cursors.up.isDown)
    {
        currentSpeed = 200;
    }
    else
    {
        if (currentSpeed > 0)
        {
            currentSpeed -= 4;
        }
    }

    if (currentSpeed > 0)
    {
        game.physics.arcade.velocityFromRotation(space_ship.rotation, currentSpeed, space_ship.body.velocity);
    }

    background.tilePosition.x = -game.camera.x;
    background.tilePosition.y = -game.camera.y;



    if (game.input.activePointer.isDown)
    {
        fire();
    }

    if(enemiesAlive==0){
        
        youwon();
    }
    if(health==0){
        
        youlose();
    }
}

function bulletHitPlayer (space_ship, bullet) {

    bullet.kill();
    if(health>0)  health-=1;

}

function bulletHitEnemy (space_ship, bullet) {

    bullet.kill();

    var destroyed = enemies[space_ship.name].damage();

    if (destroyed)
    {
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(space_ship.x, space_ship.y);
        explosionAnimation.play('EnemyDestroyed', 30, false, true);
    }

}

function fire () {

    if (game.time.now > nextFire && player_bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;

        var bullet = player_bullets.getFirstExists(false);

        bullet.reset(space_ship.x, space_ship.y);
        bullet.body.velocity.y = -400;
        bullet.rotation = game.physics.arcade.moveToPointer(bullet, 500, game.input.activePointer, 500);
        
    }

}

function GameInfo () {

    game.debug.text('Aliens Remaining: ' + enemiesAlive , 10, 60);
    game.debug.text('|  Score: ' + ((enemiesTotal-enemiesAlive)*100) + "    |   Health : " + health, 200, 60);
    game.debug.text('Controls: Use L-R Arrow Keys to rotate & U to move', 10, 80);
    game.debug.text('Move & Press Mouse to Aim & fire', 10, 100);
}
EnemyShip = function (index, game, player, bullets) {

    var x = game.world.randomX;
    var y = game.world.randomY;

    this.game = game;
    this.health = 5;
    this.player = player;
    this.bullets = bullets;
    this.fireRate = 1000;
    this.nextFire = 0;
    this.alive = true;

    
    this.space_ship = game.add.sprite(x, y, 'enemy_ship');
    
    this.space_ship.anchor.set(0.5);

    this.space_ship.name = index.toString();
    game.physics.enable(this.space_ship, Phaser.Physics.ARCADE);
    this.space_ship.body.immovable = false;
    this.space_ship.body.collideWorldBounds = true;
    this.space_ship.body.bounce.setTo(1, 1);

    this.space_ship.angle = game.rnd.angle();

    game.physics.arcade.velocityFromRotation(this.space_ship.rotation, 100, this.space_ship.body.velocity);

};

EnemyShip.prototype.damage = function() {

    this.health -= 1;

    if (this.health <= 0)
    {
        this.alive = false;

       
        this.space_ship.kill();

        return true;
    }

    return false;

}

EnemyShip.prototype.update = function() {
    

    this.space_ship.rotation = this.game.physics.arcade.angleBetween(this.space_ship, this.player);

    if (this.game.physics.arcade.distanceBetween(this.space_ship, this.player) < 300)
    {
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {
            this.nextFire = this.game.time.now + this.fireRate;

            var bullet = this.bullets.getFirstDead();

            bullet.reset(this.space_ship.x, this.space_ship.y);

            bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 500);
        }
    }

};
