const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = { x: 0, y: 0 };
let dx = gridSize;
let dy = 0;
let score = 0;
let highScore = 0;
let gameLoop = null;
let changingDirection = false;

startBtn.addEventListener('click', () => {
    welcomeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    initGame();
});

restartBtn.addEventListener('click', () => {
    restartBtn.classList.add('hidden');
    initGame();
});

document.addEventListener('keydown', changeDirection);

function initGame() {
    snake = [
        { x: 160, y: 200 },
        { x: 140, y: 200 },
        { x: 120, y: 200 }
    ];
    score = 0;
    dx = gridSize;
    dy = 0;
    scoreEl.innerText = score;
    generateFood();

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(main, 100);
}

function main() {
    if (hasGameEnded()) {
        clearInterval(gameLoop);
        restartBtn.classList.remove('hidden');
        drawGameOver();
        return;
    }

    changingDirection = false;
    clearCanvas();
    drawFood();
    moveSnake();
    drawSnake();
}

function clearCanvas() {
    ctx.fillStyle = '#010409';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? '#00ff87' : '#60efff';
        ctx.strokeStyle = '#010409';
        ctx.fillRect(part.x, part.y, gridSize, gridSize);
        ctx.strokeRect(part.x, part.y, gridSize, gridSize);
    });
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    const hasEatenFood = snake[0].x === food.x && snake[0].y === food.y;
    if (hasEatenFood) {
        score += 10;
        scoreEl.innerText = score;
        if (score > highScore) {
            highScore = score;
            highScoreEl.innerText = highScore;
        }
        generateFood();
    } else {
        snake.pop();
    }
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount) * gridSize;
    food.y = Math.floor(Math.random() * tileCount) * gridSize;

    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) generateFood();
    });
}

function drawFood() {
    ctx.fillStyle = '#ff0055';
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 10;
    ctx.fillRect(food.x, food.y, gridSize, gridSize);
    ctx.shadowBlur = 0;
}

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    if (changingDirection) return;

    const keyPressed = event.keyCode;
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -gridSize;
        dy = 0;
        changingDirection = true;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -gridSize;
        changingDirection = true;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = gridSize;
        dy = 0;
        changingDirection = true;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = gridSize;
        changingDirection = true;
    }
}

function hasGameEnded() {
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }

    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x >= canvas.width;
    const hitToptWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y >= canvas.height;

    return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall;
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 30px Segoe UI';
    ctx.fillStyle = '#ff0055';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);

    ctx.font = '16px Segoe UI';
    ctx.fillStyle = '#f0f6fc';
    ctx.fillText(`Score final : ${score}`, canvas.width / 2, canvas.height / 2 + 25);
}
