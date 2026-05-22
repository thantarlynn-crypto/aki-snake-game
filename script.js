const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const overlay = document.getElementById('overlay');
const messageEl = document.getElementById('message');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

const tileCount = 20;
const tileSize = canvas.width / tileCount;

let snake = [{ x: 10, y: 10 }];
let velocity = { x: 0, y: 0 };
let apple = { x: 5, y: 5 };
let score = 0;
let highScore = 0;
let gameInterval = null;
let speed = 4;
let isRunning = false;
let nextDirection = { x: 0, y: 0 };

const sounds = {
  eat: new Audio('data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YZQAAAAA'),
  die: new Audio('data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YZQAAAAA')
};

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  velocity = { x: 0, y: 0 };
  nextDirection = { x: 0, y: 0 };
  apple = randomApplePosition();
  score = 0;
  speed = 4;
  scoreEl.textContent = score;
  updateHighScore();
  isRunning = false;
  showOverlay('Press Start to begin');
}

function startGame() {
  if (isRunning) return;
  isRunning = true;
  hideOverlay();
  velocity = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  gameInterval = setInterval(gameLoop, 1000 / speed);
}

function restartGame() {
  clearInterval(gameInterval);
  resetGame();
  startGame();
}

function showOverlay(text) {
  messageEl.textContent = text;
  overlay.style.display = 'grid';
}

function hideOverlay() {
  overlay.style.display = 'none';
}

function randomApplePosition() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some(segment => segment.x === position.x && segment.y === position.y));
  return position;
}

function updateHighScore() {
  highScore = Math.max(highScore, score);
  highScoreEl.textContent = highScore;
}

function gameLoop() {
  velocity = nextDirection;
  const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

  if (hasCollision(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === apple.x && head.y === apple.y) {
    score += 10;
    speed = Math.min(18, 5 + Math.floor(score / 40)); // Slower ramp-up
    scoreEl.textContent = score;
    updateHighScore();
    apple = randomApplePosition();
    playSound(sounds.eat);
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 1000 / speed);
  } else {
    snake.pop();
  }

  draw();
}

function hasCollision(head) {
  const hitWall = head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
  const hitSelf = snake.some(segment => segment.x === head.x && segment.y === head.y);
  return hitWall || hitSelf;
}

function endGame() {
  clearInterval(gameInterval);
  isRunning = false;
  playSound(sounds.die);
  updateHighScore();
  showOverlay('Game over! Press Restart to play again.');
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= tileCount; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tileSize, 0);
    ctx.lineTo(i * tileSize, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * tileSize);
    ctx.lineTo(canvas.width, i * tileSize);
    ctx.stroke();
  }
}

function draw() {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  ctx.fillStyle = '#f87171';
  ctx.fillRect(apple.x * tileSize + 1, apple.y * tileSize + 1, tileSize - 2, tileSize - 2);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? '#22c55e' : '#4ade80';
    ctx.fillRect(snake[i].x * tileSize + 2, snake[i].y * tileSize + 2, tileSize - 4, tileSize - 4);
  }
}

function playSound(sound) {
  if (!sound) return;
  sound.currentTime = 0;
  sound.volume = 0.2;
  sound.play().catch(() => {});
}

window.addEventListener('keydown', event => {
  const keyMap = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
  };

  const direction = keyMap[event.key];
  if (!direction) return;
  event.preventDefault();

  if (direction.x === -velocity.x && direction.y === -velocity.y) return;
  nextDirection = direction;
});

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

resetGame();
draw();
