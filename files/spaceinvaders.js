const canvas = document.getElementById('invadersCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

let score = 0;
let player = { x: 180, y: 360, width: 40, height: 20, dx: 0 };
let bullets = [];
let aliens = [];

for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
        aliens.push({ x: c * 45 + 35, y: r * 30 + 30, width: 30, height: 20, alive: true });
    }
}
let alienDir = 2;

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') player.dx = -5;
    if (e.key === 'ArrowRight') player.dx = 5;
    if (e.key === ' ') {
        bullets.push({ x: player.x + player.width / 2 - 2, y: player.y, width: 4, height: 10 });
    }
});
document.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
});

function update() {
    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    bullets.forEach((b, index) => {
        b.y -= 7;
        if (b.y < 0) bullets.splice(index, 1);
    });

    let hitEdge = false;
    aliens.forEach(a => {
        if (!a.alive) return;
        a.x += alienDir;
        if (a.x <= 10 || a.x + a.width >= canvas.width - 10) hitEdge = true;

        bullets.forEach((b, bIdx) => {
            if (b.x > a.x && b.x < a.x + a.width && b.y > a.y && b.y < a.y + a.height) {
                a.alive = false;
                bullets.splice(bIdx, 1);
                score += 100;
                scoreEl.innerText = score;
            }
        });
    });

    if (hitEdge) {
        alienDir *= -1;
        aliens.forEach(a => a.y += 15);
    }
}

function draw() {
    ctx.fillStyle = '#010409';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff87';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = '#ff0055';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    ctx.fillStyle = '#60efff';
    aliens.forEach(a => {
        if (a.alive) ctx.fillRect(a.x, a.y, a.width, a.height);
    });
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
