// Main Game Object
var game = {
	width: 650,
	height: 350,
	colors: ['#660000', '#006600', '#000066', '#660066'],
	colorsPressed: ['#ff0000', '#00ff00', '#0000ff', '#ff00ff'],
	buttons: [],
	sequence: [],
	inputSequence: [],
	simonSpeed: 1000,
	minSimonSpeed: 300,
	simonSpeedDelta: 95,
	timer: 0,
	displaySequenceIndex: 0,
	lastTime: 0,
	timeElapsed: 0,
	phase: 1 // phase 1 = simon, phase 2 = displaying sequence, phase 3 = player's turn, phase 4 = game over
};



function init() {
	// setup the canvas and context
	game.canvas = document.getElementById("game_canvas");
	game.canvas.setAttribute('width', game.width);
	game.canvas.setAttribute('height', game.height);
	game.canvas.style.width = game.width + "px";
	game.canvas.style.height = game.height + "px";

	game.context = game.canvas.getContext("2d");

	game.buttonWidth = game.width / 2;
	game.buttonHeight = game.height / 2;

	initButtons();

	// setup mouse listener
	game.canvas.addEventListener('click', function(evt) {
		var rect = game.canvas.getBoundingClientRect();
		mouseHandler(evt.clientX - rect.left, evt.clientY - rect.top);
	}, false);
}

function initButtons() {
	var button0 = new game.button(
		0,
		0,
		game.buttonWidth,
		game.buttonHeight,
		game.colors[0],
		game.colorsPressed[0],
		0,
		new Audio("/sounds/sound0.wav"));

	game.buttons.push(button0);

	var button1 = new game.button(
		game.buttonWidth,
		0,
		game.buttonWidth,
		game.buttonHeight,
		game.colors[1],
		game.colorsPressed[1],
		1,
		new Audio("/sounds/sound1.wav"));

	game.buttons.push(button1);

	var button2 = new game.button(
		0,
		game.buttonHeight,
		game.buttonWidth,
		game.buttonHeight,
		game.colors[2],
		game.colorsPressed[2],
		2,
		new Audio("/sounds/sound2.wav"));

	game.buttons.push(button2);

	var button3 = new game.button(
		game.buttonWidth,
		game.buttonHeight,
		game.buttonWidth,
		game.buttonHeight,
		game.colors[3],
		game.colorsPressed[3],
		3,
		new Audio("/sounds/sound3.wav"));

	game.buttons.push(button3);
}

function mouseHandler(x, y) {
	if(game.phase !== 3) {
		return;  // no mouse input if not the player's turn
	}
		
	for(var b in game.buttons) {
		var btn = game.buttons[b];
		if(x > btn.x && x < btn.x + btn.width && y > btn.y && y < btn.y + btn.height) {
			btn.click();
		}
	}
}


function gameLoop(now) {
	update();
	render();
	
	game.timeElapsed = now - game.lastTime;
	game.lastTime = now;

	requestAnimationFrame(gameLoop);
}


function update() {
	for(var b in game.buttons) {
		game.buttons[b].update();
	}
		
	if(game.phase === 4) {
		return; // game is over, no more update
	}	
	
	if(game.phase === 2) {
		displaySequence();
	}
	
	if (game.phase === 1) {
		console.log("game.phase === 1");
		simonPhase();
	}
	
	if(game.phase === 3) {
		
	}
		
	if(game.inputSequence.length === game.sequence.length) {
		game.phase = 1; // simon's turn
		game.inputSequence = [];
		console.log('simon\'s turn');
	}
}

function simonPhase() {
	generateNextColor();	
	game.simonSpeed -= game.simonSpeedDelta;
	if(game.simonSpeed < game.minSimonSpeed) {
		game.simonSpeed = game.minSimonSpeed;
	}
	
	game.phase = 2;
	displaySequence();
}

function generateNextColor() {
	var code = Math.floor((Math.random() * 4));
	game.sequence.push(code);
	game.phase = 2;
	game.displaySequenceIndex = 0;
}

function displaySequence() {
  	
	if(game.displaySequenceIndex === game.sequence.length) {
		game.phase = 3;
		console.log('player turn');
		return;
	}
  	
	if(game.timer <= 0) {
		game.timer = game.simonSpeed;
		
		unlightAll();
		
		// light up the button that matches the code in the sequence
		var code = game.sequence[game.displaySequenceIndex];
		for (var b in game.buttons) {
			var button = game.buttons[b];
			if (button.numberCode === code) {
				button.lit = true;
				button.sound.play();
		  }
	  }
	  
	  game.displaySequenceIndex++;
	}
	game.timer = game.timer - game.timeElapsed;
}

function unlightAll() {
	for(var b in game.buttons) {
		game.buttons[b].lit = false;
	}
}

function render() {
	game.context.clearRect(0, 0, game.width, game.height);

	for (var b in game.buttons) {
		game.buttons[b].render();
	}
}



// Game Objects
////////////////////////////
game.button = function(x, y, width, height, color, colorPressed, numberCode, sound) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.color = color;
	this.colorPressed = colorPressed;
	this.numberCode = numberCode;
	this.lit = false;
	this.sound = sound;
	this.lightTimer = 0;

	this.render = function() {
		if (this.lit) {
			game.context.fillStyle = this.colorPressed;
		} else {
			game.context.fillStyle = this.color;
		}
		game.context.fillRect(this.x, this.y, this.width, this.height);
	};
	
	this.update = function() {
		if(this.lit && (isNaN(this.lightTimer) || this.lightTimer <= 0)) {
			this.lightTimer = 250;
		}
		
		this.lightTimer = this.lightTimer - game.timeElapsed;
		
		if(this.lightTimer <= 0) {
			this.lit = false;
		}
	}
		
	this.click = function() {
		this.lit = true;
		this.sound.play();
		game.inputSequence.push(this.numberCode);
		if(game.inputSequence[game.inputSequence.length] !== game.sequence[game.inputSequence.length]) {
			phase = 4; // game over
			console.log('game over');
		}
	};
};



// Start the game!
////////////////////////////////////////////////
init();
gameLoop();