const gridEl = document.getElementById('p4Grid');
const statusEl = document.getElementById('p4-status');
const restartBtn = document.getElementById('p4Restart');
const ROWS = 6;
const COLS = 7;
let board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
let active = true;

function createGrid() {
    gridEl.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            let cell = document.createElement('div');
            cell.classList.add('p4-cell');
            cell.dataset.col = c;
            cell.addEventListener('click', () => playerDrop(c));
            gridEl.appendChild(cell);
        }
    }
}

function playerDrop(col) {
    if (!active) return;
    let row = getNextOpenRow(col);
    if (row === -1) return;

    board[row][col] = 1;
    updateView();

    if (checkWin(1)) {
        statusEl.innerText = '🎉 Tu as gagné !';
        endGame();
        return;
    }

    active = false;
    statusEl.innerText = 'Le Bot réfléchit...';
    setTimeout(botTurn, 600);
}

function botTurn() {
    let validCols = [];
    for (let c = 0; c < COLS; c++) if (board[0][c] === 0) validCols.push(c);
    if (validCols.length === 0) return;

    let col = validCols[Math.floor(Math.random() * validCols.length)];
    let row = getNextOpenRow(col);

    board[row][col] = 2;
    updateView();

    if (checkWin(2)) {
        statusEl.innerText = '🤖 Le Bot a gagné !';
        endGame();
        return;
    }

    active = true;
    statusEl.innerText = 'À ton tour (Rouge)';
}

function getNextOpenRow(col) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === 0) return r;
    }
    return -1;
}

function updateView() {
    let cells = gridEl.children;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            let idx = r * COLS + c;
            if (board[r][c] === 1) cells[idx].style.backgroundColor = '#ff0055';
            else if (board[r][c] === 2) cells[idx].style.backgroundColor = '#ffe138';
            else cells[idx].style.backgroundColor = '#161b22';
        }
    }
}

function checkWin(player) {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (c + 3 < COLS && board[r][c] === player && board[r][c+1] === player && board[r][c+2] === player && board[r][c+3] === player) return true;
            if (r + 3 < ROWS && board[r][c] === player && board[r+1][c] === player && board[r+2][c] === player && board[r+3][c] === player) return true;
            if (r + 3 < ROWS && c + 3 < COLS && board[r][c] === player && board[r+1][c+1] === player && board[r+2][c+2] === player && board[r+3][c+3] === player) return true;
            if (r - 3 >= 0 && c + 3 < COLS && board[r][c] === player && board[r-1][c+1] === player && board[r-2][c+2] === player && board[r-3][c+3] === player) return true;
        }
    }
    return false;
}

function endGame() {
    active = false;
    restartBtn.classList.remove('hidden');
}

restartBtn.addEventListener('click', () => {
    board = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    active = true;
    statusEl.innerText = 'À ton tour (Rouge)';
    restartBtn.classList.add('hidden');
    updateView();
});

createGrid();
