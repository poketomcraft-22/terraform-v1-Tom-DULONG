const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

let ball = { x: 200, y: 150, radius: 8, dx: 3, dy: 3 };
let player = { x: 10, y: 120, width: 10, height: 60, dy: 0 };
let bot = { x: 380, y: 120, width: 10, height: 60 };

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') player.dy = -5;
    if (e.key === 'ArrowDown') player.dy = 5;
});
document.addEventListener('keyup', e => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') player.dy = 0;
});

function update() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) ball.dy *= -1;

    player.y += player.dy;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

    if (bot.y + bot.height / 2 < ball.y) bot.y += 3;
    else if (bot.y + bot.height / 2 > ball.y) bot.y -= 3;

    if (ball.x - ball.radius < player.x + player.width && ball.y > player.y && ball.y < player.y + player.height) {
        ball.dx *= -1;
        ball.x = player.x + player.width + ball.radius;
    }

    if (ball.x + ball.radius > bot.x && ball.y > bot.y && ball.y < bot.y + bot.height) {
        ball.dx *= -1;
        ball.x = bot.x - ball.radius;
    }

    if (ball.x < 0 || ball.x > canvas.width) {
        ball.x = 200;
        ball.y = 150;
        ball.dx *= -1;
    }
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
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();

