const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

const radius = 15;
const colors = ['#ff0055', '#58a6ff', '#238636', '#e6a23c', '#b464ff'];

let score = 0;
let grid = [];
let currentBubble, nextColor;
let isGameOver = false;

function initGame() {
    score = 0;
    scoreEl.innerText = score;
    isGameOver = false;
    restartBtn.classList.add('hidden');

    grid = [];
    // Créer les 4 premières lignes de bulles au plafond
    for (let r = 0; r < 4; r++) {
        let row = [];
        for (let c = 0; c < 10; c++) {
            row.push(colors[Math.floor(Math.random() * colors.length)]);
        }
        grid.push(row);
    }

    spawnBubble();
    loop();
}

function spawnBubble() {
    nextColor = colors[Math.floor(Math.random() * colors.length)];
    currentBubble = {
        x: canvas.width / 2,
        y: canvas.height - 30,
        vx: 0,
        vy: 0,
        color: nextColor
    };
}

canvas.addEventListener('click', (e) => {
    if (isGameOver || currentBubble.vy !== 0) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let angle = Math.atan2(mouseY - currentBubble.y, mouseX - currentBubble.x);
    let speed = 8;
    currentBubble.vx = Math.cos(angle) * speed;
    currentBubble.vy = Math.sin(angle) * speed;
});

restartBtn.addEventListener('click', initGame);

function update() {
    if (isGameOver) return;

    if (currentBubble.vy !== 0) {
        currentBubble.x += currentBubble.vx;
        currentBubble.y += currentBubble.vy;

        // Rebond murs latéraux
        if (currentBubble.x - radius < 0 || currentBubble.x + radius > canvas.width) {
            currentBubble.vx *= -1;
        }

        // Touche le haut ou collision avec une autre bulle
        if (currentBubble.y - radius <= 0 || checkCollision()) {
            snapBubble();
        }
    }
}

function checkCollision() {
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c]) {
                let bx = c * (radius * 2) + radius + (r % 2 === 0 ? 0 : radius);
                let by = r * (radius * 1.732) + radius;
                let dist = Math.hypot(currentBubble.x - bx, currentBubble.y - by);
                if (dist < radius * 2) return true;
            }
        }
    }
    return false;
}

function snapBubble() {
    // Calcul de la position la plus proche dans la grille
    let r = Math.round((currentBubble.y - radius) / (radius * 1.732));
    let offset = (r % 2 === 0 ? 0 : radius);
    let c = Math.round((currentBubble.x - radius - offset) / (radius * 2));

    r = Math.max(0, Math.min(r, 12));
    c = Math.max(0, Math.min(c, 9));

    if (!grid[r]) grid[r] = [];
    grid[r][c] = currentBubble.color;

    score += 20;
    scoreEl.innerText = score;

    if (r >= 10) {
        isGameOver = true;
        restartBtn.classList.remove('hidden');
    } else {
        spawnBubble();
    }
}

function draw() {
    ctx.fillStyle = '#010409';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dessiner la grille
    for (let r = 0; r < grid.length; r++) {
        if (!grid[r]) continue;
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c]) {
                let bx = c * (radius * 2) + radius + (r % 2 === 0 ? 0 : radius);
                let by = r * (radius * 1.732) + radius;
                ctx.fillStyle = grid[r][c];
                ctx.beginPath();
                ctx.arc(bx, by, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#30363d';
                ctx.stroke();
            }
        }
    }

    // Dessiner la bulle courante
    if (currentBubble) {
        ctx.fillStyle = currentBubble.color;
        ctx.beginPath();
        ctx.arc(currentBubble.x, currentBubble.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f0f6fc';
        ctx.stroke();
    }

    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 25px Segoe UI';
        ctx.fillStyle = '#ff0055';
        ctx.textAlign = 'center';
        ctx.fillText('FIN DE PARTIE', canvas.width / 2, canvas.height / 2);
    }
}

function loop() {
    update();
    draw();
    if (!isGameOver) requestAnimationFrame(loop);
}

initGame();
