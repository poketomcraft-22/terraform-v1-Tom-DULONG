const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const playerScoreEl = document.getElementById('playerScore');
const botScoreEl = document.getElementById('botScore');
const restartBtn = document.getElementById('pongRestart');

let ball, player, bot, pScore, bScore, gameOver;

function initPong() {
    ball = { x: 200, y: 150, radius: 8, dx: 3, dy: 3 };
    player = { x: 10, y: 120, width: 10, height: 60, dy: 0 };
    bot = { x: 380, y: 120, width: 10, height: 60 };
    pScore = 0;
    bScore = 0;
    gameOver = false;
    playerScoreEl.innerText = pScore;
    botScoreEl.innerText = bScore;
    restartBtn.classList.add('hidden');
}

document.addEventListener('keydown', e => {
    if (gameOver) return;
    if (e.key === 'ArrowUp') player.dy = -5;
    if (e.key === 'ArrowDown') player.dy = 5;
});
document.addEventListener('keyup', e => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') player.dy = 0;
});

restartBtn.addEventListener('click', initPong);

function update() {
    if (gameOver) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) ball.dy *= -1;

    player.y += player.dy;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

    // IA du bot
    if (bot.y + bot.height / 2 < ball.y) bot.y += 3;
    else if (bot.y + bot.height / 2 > ball.y) bot.y -= 3;

    // Rebond joueur
    if (ball.x - ball.radius < player.x + player.width && ball.y > player.y && ball.y < player.y + player.height) {
        ball.dx *= -1;
        ball.x = player.x + player.width + ball.radius;
    }

    // Rebond bot
    if (ball.x + ball.radius > bot.x && ball.y > bot.y && ball.y < bot.y + bot.height) {
        ball.dx *= -1;
        ball.x = bot.x - ball.radius;
    }

    // Gestion des points
    if (ball.x < 0) {
        bScore++;
        botScoreEl.innerText = bScore;
        resetBall(1);
    } else if (ball.x > canvas.width) {
        pScore++;
        playerScoreEl.innerText = pScore;
        resetBall(-1);
    }

    if (pScore >= 5 || bScore >= 5) {
        gameOver = true;
        restartBtn.classList.remove('hidden');
    }
}

function resetBall(dir) {
    ball.x = 200;
    ball.y = 150;
    ball.dx = 3 * dir;
    ball.dy = 3;
}

function draw() {
    ctx.fillStyle = '#010409';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#30363d';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    ctx.fillStyle = '#00ff87';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(bot.x, bot.y, bot.width, bot.height);

    ctx.fillStyle = '#f0f6fc';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 25px Segoe UI';
        ctx.fillStyle = pScore >= 5 ? '#00ff87' : '#ff0055';
        ctx.textAlign = 'center';
        ctx.fillText(pScore >= 5 ? 'VICTOIRE !' : 'DÉFAITE...', canvas.width / 2, canvas.height / 2);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

initPong();
loop();
