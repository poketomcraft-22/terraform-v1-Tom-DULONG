const canvas = document.getElementById('invadersCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

let score = 0;
let player, bullets, aliens, alienDir, isGameOver, wave;

function initGame() {
    score = 0;
    wave = 1;
    scoreEl.innerText = score;
    player = { x: 180, y: 360, width: 40, height: 20, dx: 0 };
    bullets = [];
    isGameOver = false;
    restartBtn.classList.add('hidden');
    spawnWave();
}

function spawnWave() {
    aliens = [];
    alienDir = 0.4; // Vitesse de déplacement horizontale très lente au début
    // Une seule ligne d'aliens au départ pour ne pas submerger le joueur, qui augmente un tout petit peu par vague
    let rowsCount = Math.min(2 + Math.floor(wave / 2), 4);

    for (let r = 0; r < rowsCount; r++) {
        for (let c = 0; c < 8; c++) {
            aliens.push({ x: c * 45 + 35, y: r * 30 + 30, width: 30, height: 20, alive: true });
        }
    }
}

document.addEventListener('keydown', e => {
    if (isGameOver) return;
    if (e.key === 'ArrowLeft') player.dx = -5;
    if (e.key === 'ArrowRight') player.dx = 5;
    if (e.key === ' ') {
        bullets.push({ x: player.x + player.width / 2 - 2, y: player.y, width: 4, height: 10 });
    }
});

document.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
});

restartBtn.addEventListener('click', initGame);

function update() {
    if (isGameOver) return;

    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    bullets.forEach((b, index) => {
        b.y -= 7;
        if (b.y < 0) bullets.splice(index, 1);
    });

    let hitEdge = false;
    let allDead = true;

    aliens.forEach(a => {
        if (!a.alive) return;
        allDead = false;
        a.x += alienDir;
        if (a.x <= 10 || a.x + a.width >= canvas.width - 10) hitEdge = true;

        // Si les aliens touchent le joueur -> Fin de partie
        if (a.y + a.height >= player.y) {
            isGameOver = true;
        }

        bullets.forEach((b, bIdx) => {
            if (b.x > a.x && b.x < a.x + a.width && b.y > a.y && b.y < a.y + a.height) {
                a.alive = false;
                bullets.splice(bIdx, 1);
                score += 50;
                scoreEl.innerText = score;
            }
        });
    });

    if (hitEdge) {
        alienDir *= -1;
        aliens.forEach(a => a.y += 8); // Descente très lente et progressive des lignes
    }

    // Si tous les aliens sont morts, on relance une nouvelle vague un peu plus corsée en boucle
    if (allDead) {
        wave++;
        spawnWave();
    }

    if (isGameOver) {
        restartBtn.classList.remove('hidden');
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

    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 30px Segoe UI';
        ctx.fillStyle = '#ff0055';
        ctx.textAlign = 'center';
        ctx.fillText('FIN DE PARTIE', canvas.width / 2, canvas.height / 2);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

initGame();
loop();
