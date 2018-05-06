'use strict';

/**
* Global variables
**/

/* music */
const playCoin = document.querySelector("#playCoin");
const gameLoop = document.querySelector("#gameLoop");
const win = document.querySelector("#win");
const loose = document.querySelector("#loose");
gameLoop.loop = true;
/* variables */
const modalContent = document.querySelector('.modal-content');
const modal = document.querySelector('.modal');
let lap = 0;
let locked = false;

/**
* Function to build the modal when the page is loaded.
* This modal is used to inform the player about rules and how to play.
**/
(function openingModal() {
  modalContent.innerHTML = '<h1 class="centered">Welcome to the Game!</h1><h3>Rules are simple:</h3><ul><li>Avoid Enemies;</li><li><strong>Reach the top to gain +1 life and +50 points</strong>;</li><li><strong>Game is won if the top is reached 5 times!</strong></li><li>3 lifes;</li><li>The character can move <strong>up, down, left, right</strong>;</li><li><strong>Bonus, only if the game is won, points are multiplied by saved lives!!!</strong></li></ul><h2 class="centered">Move the character by arrow keys. Have fun!</h2><button class="close button centered">PLAY!</button>';
})();

/**
* Listener on the button of the first modal.
* Once the button is pressed, the modal disappears and the music is played.
**/
const closeModal = document.querySelector('.close');
closeModal.onclick = function() {
  modal.style.display = "none";
  playCoin.play();
  gameLoop.play();
};

/**
* Class that builds a generic character.
* Main parameters are x and y position on canvas and the image.
**/
class Character {
  constructor (x, y, sprite) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
  }
  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
}

/**
* Class that builds an Enemy, extends the class Character.
* Main parameters are x and y position on canvas and the image.
**/
class Enemy extends Character {

  constructor(x, y, sprite, speed) {
    super(x, y, sprite);
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.speed = speed;
  }

  update(dt) {
    /* sets speed and direction (right) of external enemy rows or resets enemy */
    if (this.y !== 140){
      if (this.x < canvasWidth) {
        this.x += this.speed * dt;
      } else { this.x = -40; }
    }
    /* sets speed and direction (left) of central enemy row or resets enemy */
    if (this.y === 140) {
      if (this.x > -60) {
        this.x -= this.speed * dt;
      } else { this.x = 550; }
    }
    /* Player-Enemy collision check */
    if (this.x + 53 >= player.x &&
        this.x <= player.x + 53 &&
        this.y - 53 <= player.y &&
        this.y >= player.y - 53) {
          /* If true player is teleported to start */
          player.x = 205; player.y = 395;
          player.lives--;
          if (player.lives === 0) {
            /* Keyboard is locked to prevent moves at game stopped */
            locked = true;
            gameOver();
            restartButton();
          }
    }
  }

}

/**
* All the enemies and an array containing them.
**/
const enemy1 = new Enemy(10, 55, 'images/bad-boy.png', 200);
const enemy2 = new Enemy(150, 140, 'images/bad-boy.png', 250);
const enemy3 = new Enemy(10, 225, 'images/bad-boy.png', 300);
const enemy4 = new Enemy(210, 55, 'images/bad-boy.png', 200);
const enemy5 = new Enemy(350, 140, 'images/bad-boy.png', 250);
const enemy6 = new Enemy(210, 225, 'images/bad-boy.png', 300);

const allEnemies = [enemy1, enemy2, enemy3, enemy4, enemy5, enemy6];

/**
* Class that builds the Player, extends the class Character.
* Main parameters are x and y position on canvas and the image.
* Other parameters are lives and score.
**/
class Player extends Character {
  constructor(x, y, sprite) {
    super(x, y, sprite);
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.lives = 3;
    this.score = 0;
  }

  update(dt) {
  }

  handleInput(pressedKeys) {
    /* If the keyboard is set to locked, prevents further key press */
    if (locked) return;
    /* Otherwise moves the player and sets canvas' limits */
    if (pressedKeys === 'left' && this.x > 33) {
      this.x -= 100;
    }
    else if (pressedKeys === 'up' && this.y > 60) {
      this.y -= 83;
    }
    else if (pressedKeys === 'right' && this.x < 400) {
      this.x += 100;
    }
    else if (pressedKeys === 'down' && this.y < 395) {
      this.y += 83;
    }
    /* If the player reaches the top, points lives and lap are updated */
    if (this.y < 63) {
      this.score += 50;
      this.lives++;
      lap++;
      if (lap === 5) {
        /* Keyboard is locked to prevent moves at game stopped */
        locked = true;
        endGame();
        restartButton();
      } else {
        /* Keyboard is locked to prevent moves causing unwanted game behaviour */
        locked = true;
        /* Player is teleported at start after a short delay */
        setTimeout( () => {
          player.x = 205;
          player.y = 395;
          locked = false;
        }, 1500);
      }

    }
  }

}

/**
* The player.
**/
const player = new Player(205, 395, 'images/good-girl.png');//205.395

/**
* Event listener for pressed keys
**/
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  player.handleInput(allowedKeys[e.keyCode]);
});

/**
* This function is called to set a listener on the restart button
*   once the button is built if needed.
**/
function restartButton() {
    const restartGame = document.querySelector('.restart');
    restartGame.onclick = function() {
      document.location.reload();
    };
}

/**
* This function is called when the game is won.
* The modal is cleaned and filled with a victory message and a brief recap.
* It is played a music for the game just won.
**/
function endGame() {
  stopMusic();
  win.play();
  modal.style.display = "block";
  modalContent.innerHTML = `<h1 class="centered">Congratulation!</h1><h3 class="centered">You have completed the game!</h3><h3 class="centered">Points scored: ${player.score}</h3><h3 class="centered">Lives saved: ${player.lives}</h3><h3 class="centered">Final Score: ${player.score*player.lives}</h3><button class="restart button centered">RESTART!</button>`;
}

/**
* This function is called when the game is not won.
* The modal is cleaned and filled with a message about the fail and a brief
*   recap.
* It is played a music for the game failed to win.
**/
function gameOver() {
  stopMusic();
  loose.play();
  modal.style.display = "block";
  modalContent.innerHTML = `<h1 class="centered">Game Over!</h1><h3 class="centered">You have lost all lives and collected ${player.score} points!</h3><button class="restart button centered">RESTART!</button>`;
}

/**
* This function is called to pause the game music, when the game is stopped.
**/
function stopMusic() {
  gameLoop.pause();
}
