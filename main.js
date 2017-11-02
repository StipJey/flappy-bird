var mainState = {
    preload: function() {
        // Load the bird sprite
        //game.load.image('bird', 'assets/bird.png');
        game.load.spritesheet('bird', 'assets/animated_bird.png', 92, 64, 3);
        //game.load.image('pipe', 'assets/pipe.png');
        game.load.image('pipe', 'assets/pipe_long.png');
        game.load.audio('jump', 'assets/jump.wav');
    },

    create: function() {
        this.score = 0;

        this.jumpSound = game.add.audio('jump');
        // Create an empty group
        this.pipes = game.add.group();

        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);
        // Change the background color of the game to blue
        game.stage.backgroundColor = '#71c5cf';

        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Display the bird at the position x=100 and y=245
        this.bird = game.add.sprite(100, 245, 'bird');
        this.bird.anchor.setTo(0.5, 0.5);
        this.bird.animations.add('fly', [1,2,3,1,2,3]);

        // Add physics to the bird
        // Needed for: movements, gravity, collisions, etc.
        game.physics.arcade.enable(this.bird);

        // Add gravity to the bird to make it fall
        this.bird.body.gravity.y = 1000;

        // Call the 'jump' function when the spacekey is hit
        var spaceKey = game.input.keyboard.addKey(
            Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);
    },

    update: function() {
        // If the bird is out of the screen (too high or too low)
        // Call the 'restartGame' function
        if (this.bird.y < 0 || this.bird.y > 490)
            this.restartGame();

        if (this.bird.angle < 20)
            this.bird.angle += 1;

        this.pipes.forEachAlive(function(pipe) {
            if (pipe.y >= 0 && this.bird.x > pipe.x && this.bird.x <= pipe.x - pipe.deltaX) {
                this.score++;
                console.log(this.score);
            }
        }, this);

        game.physics.arcade.overlap(
            this.bird, this.pipes, this.hitPipe, null, this);
    },

    hitPipe: function() {
        // If the bird has already hit a pipe, do nothing
        // It means the bird is already falling off the screen
        if (this.bird.alive === false)
            return;

        // Set the alive property of the bird to false
        this.bird.alive = false;

        // Prevent new pipes from appearing
        game.time.events.remove(this.timer);

        // Go through all the pipes, and stop their movement
        this.pipes.forEach(function(p){
            p.body.velocity.x = 0;
        }, this);
    },

    // Make the bird jump
    jump: function() {
        if (this.bird.alive === false)
            return;
        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;
        this.bird.animations.play('fly', 10, false);
        game.add.tween(this.bird).to({angle: -20}, 100).start();
        this.jumpSound.play();
    },

    // Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        game.state.start('main');
    },

    addOnePipe: function(x, y) {
        // Create a pipe at the position x and y
        var pipe = game.add.sprite(x, y, 'pipe');

        // Add the pipe to our previously created group
        this.pipes.add(pipe);

        // Enable physics on the pipe
        game.physics.arcade.enable(pipe);

        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200;

        // Automatically kill the pipe when it's no longer visible
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },

    addRowOfPipes: function() {
        // Randomly pick a number between 1 and 5
        // This will be the hole position
        var hole = Math.floor(Math.random() * 6);

        // Add the 6 pipes
        // With one big hole at position 'hole' and 'hole + 1'
        this.addOnePipe(400, -380 + hole * 50);
        this.addOnePipe(400, 190 + hole * 50);
    }
};

// Initialize Phaser, and create a 400px by 490px game
var game = new Phaser.Game(400, 490);

// Add the 'mainState' and call it 'main'
game.state.add('main', mainState);

// Start the state to actually start the game
game.state.start('main');
