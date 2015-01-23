// Simon



/* Game Phases
 * ------------------------------
 *
 * Phase 0 - Main Menu screen
 * |
 * |
 * |_ Phase 1 - Simon's Turn
 *   |
 *   |
 *   |_ Phase 2 - Display Sequence
 *     |
 *     |
 *     |_ Phase 3 - Player's Turn - if correct, go to Phase 1, else Phase 4
 *       |
 *       |
 *       |_ Phase 4 - Game Over
 *
 */


// Main Game Object
var game = {
	// width: 650,
	// height: 350,
	colors: ['#660000', '#006600', '#000066', '#660066', '#aad740'],
	colorsPressed: ['#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#EFFA40'],
	buttons: [],
	sequence: [],
	inputSequence: [],
	simonSpeed: 1000,
	minSimonSpeed: 300,
	simonSpeedDelta: 95,
	timer: 0,
	defaultUserTimeout: 2000, // user has 2 seconds for each color, or game over
	displaySequenceIndex: 0,
	lastTime: 0,
	timeElapsed: 0,
	phase: 0
};




function init() {
	// setup the canvas and context
	game.canvas = document.createElement("canvas");
	document.body.appendChild(game.canvas);
	// game.canvas = document.getElementById("game_canvas");
	game.canvas.setAttribute('width', game.width);
	game.canvas.setAttribute('height', game.height);
	game.canvas.style.width = game.width + "px";
	game.canvas.style.height = game.height + "px";
	
	game.canvas.width= window.innerWidth; 
	game.canvas.height= window.innerHeight

	game.context = game.canvas.getContext("2d");
	
	game.gameOverSound = new Audio("/sounds/game_over.wav");

	game.buttonWidth = game.canvas.width / 2;
	game.buttonHeight = game.canvas.height / 2;

	initButtons();

	// setup mouse listener
	game.canvas.addEventListener('click', function(evt) {
		var rect = game.canvas.getBoundingClientRect();
		mouseHandler(evt.clientX - rect.left, evt.clientY - rect.top);
	}, false);
	
	// setup touch listener
	game.canvas.addEventListener('touchstart', function(e) {
	    e.preventDefault();
	    var touch = e.touches[0];
	    mouseHandler(touch.pageX, touch.pageY);
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
		new Audio("/sounds/sound0.wav"),
		false);

	game.buttons.push(button0);

	var button1 = new game.button(
		game.buttonWidth,
		0,
		game.buttonWidth,
		game.buttonHeight,
		game.colors[1],
		game.colorsPressed[1],
		1,
		new Audio("/sounds/sound1.wav"),
		false);

	game.buttons.push(button1);

	var button2 = new game.button(
		0,
		game.buttonHeight,
		game.buttonWidth,
		game.buttonHeight,
		game.colors[2],
		game.colorsPressed[2],
		2,
		new Audio("/sounds/sound2.wav"),
		false);

	game.buttons.push(button2);

	var button3 = new game.button(
		game.buttonWidth,
		game.buttonHeight,
		game.buttonWidth,
		game.buttonHeight,
		game.colors[3],
		game.colorsPressed[3],
		3,
		new Audio("/sounds/sound3.wav"),
		false);

	game.buttons.push(button3);
	
	var startButton = new game.button(
		game.canvas.width/2 - game.buttonWidth / 8,
		game.canvas.height/2 - game.buttonHeight / 8,
		game.buttonWidth / 4,
		game.buttonHeight / 4,
		game.colors[4],
		game.colorsPressed[4],
		4,
		new Audio("/sounds/gameStart.wav"),
		true);
	game.buttons.push(startButton);
}

function mouseHandler(x, y) {
	
	if(game.phase !== 3 && game.phase !== 0) {
		return;  // no mouse input if not the player's turn or the main menu
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
		
	// Main Menu
	if (game.phase === 0) {
		// todo menu
		return;
	}
	
	// Simon's Turn
	if (game.phase === 1) {
		simonPhase();
		return;
	}
		
	// Display the Sequence
	if(game.phase === 2) {
		displaySequence();
		return;
	}
		
	// Player's Turn
	if(game.phase === 3) {
		game.timer = game.timer - game.timeElapsed;
		if(game.timer <= 0) {
			gameOver();
		}
	}
	
	// Game Over
	if(game.phase === 4) {
		// todo game over screen
			
		setHighScore();
		return; 
	}	
	
	if(game.inputSequence.length === game.sequence.length) {
		game.phase = 1; // simon's turn
		game.inputSequence = [];
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

function gameOver() {
	game.phase = 4;
	game.gameOverSound.play();
}

function displaySequence() {
  	
	if(game.displaySequenceIndex === game.sequence.length) {
		game.phase = 3;
		game.timer = game.defaultUserTimeout; // start the timer
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
	
	if(game.phase === 0 || game.phase === 4) {
		renderHighScore();
	}
	else {
		renderTotalColors();
	}
}

function renderHighScore() {
	game.context.fillStyle = "#ffffff";
  	game.context.font="20px Georgia";
  	var text = "High Score: " + getHighScore();
  	game.context.fillText(text, game.canvas.width/2 - text.length*5, 35);
}

function renderTotalColors() {
	game.context.fillStyle = "#000000";
  	game.context.font="75px Georgia";
  	var text = game.sequence.length.toString();
  	game.context.fillText(text, game.canvas.width/2 - text.length*20, game.canvas.height / 2 + 20);
}

function getHighScore() {
	var score = localStorage.getItem('highScore');
	if(score === undefined) {
		return 0;
	}
	else return score;
}

function setHighScore() {
	var currHigh = localStorage.getItem('highScore');
	if(currHigh === undefined || currHigh < game.sequence.length-1) {
		localStorage.setItem('highScore', game.sequence.length-1);
	}
}



// Game Objects
////////////////////////////
game.button = function(x, y, width, height, color, colorPressed, numberCode, sound, isStart) {
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
	this.isStart = isStart;

	this.render = function() {
		if (this.lit) {
			game.context.fillStyle = this.colorPressed;
		} else {
			game.context.fillStyle = this.color;
		}
		
		if(this.isStart) {
			game.context.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, 2 * Math.PI, false);
      		game.context.fill();
      		if(game.phase === 0) {
	      		game.context.fillStyle = "#000000";
	      		game.context.font="20px Georgia";
	      		game.context.fillText("Touch to", this.x + this.width / 3.6, this.y + 10);
	      		game.context.font="26px Georgia";
	      		game.context.fillText("Start!", this.x + this.width/3.6 + 8, this.y + 45);
      		}
		}
		else {
			game.context.fillRect(this.x, this.y, this.width, this.height);
		}
	};
	
	this.update = function() {
		if(this.lit && (isNaN(this.lightTimer) || this.lightTimer <= 0)) {
			this.lightTimer = 250;
		}
		
		this.lightTimer = this.lightTimer - game.timeElapsed;
		
		if(this.lightTimer <= 0) {
			this.lit = false;
		}
	};
		
	this.click = function() {
		if(this.isStart && game.phase !== 0 && game.phase !== 4) {
			return;
		}
		if(!this.isStart && (game.phase === 0 || game.phase === 4)) {
			return;
		}
		
		game.inputSequence.push(this.numberCode);
		if(!this.isStart 
				&& game.inputSequence[game.inputSequence.length-1] !== game.sequence[game.inputSequence.length-1]) {
			gameOver();
			return;
		}
		else {
			game.timer = game.defaultUserTimeout; // reset the timer
		}
		
		if(this.isStart) {
			game.phase = 1; // start the game
			game.sequence = [];
			game.inputSequence = [];
		}
		
		this.lit = true;
		this.sound.play();
	};
};



// Start the game!
////////////////////////////////////////////////
init();
gameLoop();