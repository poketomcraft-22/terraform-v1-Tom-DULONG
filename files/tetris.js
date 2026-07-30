const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

const holdCanvas = document.getElementById('holdCanvas');
const holdCtx = holdCanvas.getContext('2d');
holdCtx.scale(20, 20);

const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');
nextCtx.scale(20, 20);

const colors = [
    null,
    '#FF0d72', // T
    '#0dc2ff', // O
    '#0dff72', // L
    '#f538ff', // J
    '#ff8e0d', // I
    '#ffe138', // S
    '#3877ff', // Z
];

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === 'T') {
        return [[0, 0, 0], [1, 1, 1], [0, 1, 0]];
    } else if (type === 'O') {
        return [[2, 2], [2, 2]];
    } else if (type === 'L') {
        return [[0, 0, 3], [3, 3, 3], [0, 0, 0]];
    } else if (type === 'J') {
        return [[4, 0, 0], [4, 4, 4], [0, 0, 0]];
    } else if (type === 'I') {
        return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
    } else if (type === 'S') {
        return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
    } else if (type === 'Z') {
        return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
    }
}

const arena = createMatrix(12, 20);
const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
    lines: 0
};

let holdPiece = null;
let nextPieceType = null;
let canHold = true;

function getRandomPieceType() {
    const pieces = 'TJLOSZI';
    return pieces[Math.floor(pieces.length * Math.random())];
}

function drawMatrix(matrix, offset, ctx = context) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = colors[value];
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function drawMini(matrix, ctx, canvasElem) {
    ctx.fillStyle = '#010409';
    ctx.fillRect(0, 0, canvasElem.width, canvasElem.height);
    if (!matrix) return;
    const matrixWidth = matrix[0].length;
    const matrixHeight = matrix.length;
    const offsetX = (4 - matrixWidth) / 2;
    const offsetY = (4 - matrixHeight) / 2;
    drawMatrix(matrix, {x: offsetX, y: offsetY}, ctx);
}

function draw() {
    context.fillStyle = '#010409';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function arenaSweep() {
    let rowCount = 0;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        rowCount++;
    }

    if (rowCount > 0) {
        player.lines += rowCount;
        if (rowCount === 1) player.score += 40;
        else if (rowCount === 2) player.score += 100;
        else if (rowCount === 3) player.score += 300;
        else if (rowCount === 4) player.score += 1200;

        updateScore();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    if (nextPieceType === null) {
        nextPieceType = getRandomPieceType();
    }
    player.matrix = createPiece(nextPieceType);
    nextPieceType = getRandomPieceType();
    drawMini(createPiece(nextPieceType), nextCtx, nextCanvas);

    player.pos.y = 0;
    player.pos.x = Math.floor((arena[0].length / 2) - (player.matrix[0].length / 2));
    canHold = true;

    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        player.lines = 0;
        updateScore();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
    document.getElementById('lines').innerText = player.lines;
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

window.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        playerMove(-1);
    } else if (event.key === 'ArrowRight') {
        playerMove(1);
    } else if (event.key === 'ArrowDown') {
        playerDrop();
        player.score += 1;
        updateScore();
    } else if (event.key === 'q' || event.key === 'Q') {
        playerRotate(-1);
    } else if (event.key === 'd' || event.key === 'D') {
        playerRotate(1);
    } else if (event.key === 'c' || event.key === 'C') {
        if (canHold) {
            const currentMat = player.matrix;
            if (holdPiece === null) {
                holdPiece = currentMat;
                playerReset();
            } else {
                const temp = holdPiece;
                holdPiece = currentMat;
                player.matrix = temp;
                player.pos.y = 0;
                player.pos.x = Math.floor((arena[0].length / 2) - (player.matrix[0].length / 2));
            }
            drawMini(holdPiece, holdCtx, holdCanvas);
            canHold = false;
        }
    }
});

playerReset();
update();
