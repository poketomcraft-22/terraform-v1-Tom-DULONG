const gridDisplay = document.getElementById('grid-2048');
const scoreDisplay = document.getElementById('score');
let board = [];
let score = 0;
const width = 4;

function createBoard() {
    // Réinitialisation du score et de l'affichage
    score = 0;
    scoreDisplay.innerText = score;

    gridDisplay.innerHTML = '';
    board = [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
    ];

    generate();
    generate();
    drawBoard();
}

function generate() {
    let emptySquares = board.filter(val => val === 0);
    if (emptySquares.length === 0) return;

    let randomNumber = Math.floor(Math.random() * board.length);
    if (board[randomNumber] === 0) {
        board[randomNumber] = Math.random() < 0.9 ? 2 : 4;
    } else {
        generate();
    }
}

function drawBoard() {
    gridDisplay.innerHTML = '';
    board.forEach(val => {
        const tile = document.createElement('div');
        tile.classList.add('tile-2048');
        tile.innerHTML = val === 0 ? '' : val;

        // Couleurs de fond selon la valeur de la tuile
        if (val > 0) {
            tile.style.backgroundColor = getTileColor(val);
            tile.style.color = val > 4 ? '#f0f6fc' : '#161b22';
        } else {
            tile.style.backgroundColor = '#30363d';
        }

        gridDisplay.appendChild(tile);
    });
}

function getTileColor(val) {
    const colors = {
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e'
    };
    return colors[val] || '#3c3a32';
}

// Gestion des mouvements (Glissements)
function moveRight() {
    let changed = false;
    for (let i = 0; i < 16; i += width) {
        let row = [board[i], board[i+1], board[i+2], board[i+3]];
        let filteredRow = row.filter(num => num !== 0);
        let missing = width - filteredRow.length;
        let zeros = Array(missing).fill(0);
        let newRow = zeros.concat(filteredRow);

        for (let j = width - 1; j > 0; j--) {
            if (newRow[j] === newRow[j - 1] && newRow[j] !== 0) {
                let combinedValue = newRow[j] * 2;
                newRow[j] = combinedValue;
                score += combinedValue;
                newRow[j - 1] = 0;
            }
        }

        filteredRow = newRow.filter(num => num !== 0);
        missing = width - filteredRow.length;
        zeros = Array(missing).fill(0);
        newRow = filteredRow.concat(zeros);

        for (let j = 0; j < width; j++) {
            if (board[i + j] !== newRow[j]) changed = true;
            board[i + j] = newRow[j];
        }
    }
    if (changed) {
        scoreDisplay.innerText = score;
        generate();
        drawBoard();
        checkGameOver();
    }
}

function moveLeft() {
    let changed = false;
    for (let i = 0; i < 16; i += width) {
        let row = [board[i], board[i+1], board[i+2], board[i+3]];
        let filteredRow = row.filter(num => num !== 0);
        let missing = width - filteredRow.length;
        let zeros = Array(missing).fill(0);
        let newRow = filteredRow.concat(zeros);

        for (let j = 0; j < width - 1; j++) {
            if (newRow[j] === newRow[j + 1] && newRow[j] !== 0) {
                let combinedValue = newRow[j] * 2;
                newRow[j] = combinedValue;
                score += combinedValue;
                newRow[j + 1] = 0;
            }
        }

        filteredRow = newRow.filter(num => num !== 0);
        missing = width - filteredRow.length;
        zeros = Array(missing).fill(0);
        newRow = filteredRow.concat(zeros);

        for (let j = 0; j < width; j++) {
            if (board[i + j] !== newRow[j]) changed = true;
            board[i + j] = newRow[j];
        }
    }
    if (changed) {
        scoreDisplay.innerText = score;
        generate();
        drawBoard();
        checkGameOver();
    }
}

function moveUp() {
    let changed = false;
    for (let i = 0; i < width; i++) {
        let column = [board[i], board[i+width], board[i+width*2], board[i+width*3]];
        let filteredColumn = column.filter(num => num !== 0);
        let missing = width - filteredColumn.length;
        let zeros = Array(missing).fill(0);
        let newColumn = filteredColumn.concat(zeros);

        for (let j = 0; j < width - 1; j++) {
            if (newColumn[j] === newColumn[j + 1] && newColumn[j] !== 0) {
                let combinedValue = newColumn[j] * 2;
                newColumn[j] = combinedValue;
                score += combinedValue;
                newColumn[j + 1] = 0;
            }
        }

        filteredColumn = newColumn.filter(num => num !== 0);
        missing = width - filteredColumn.length;
        zeros = Array(missing).fill(0);
        newColumn = filteredColumn.concat(zeros);

        for (let j = 0; j < width; j++) {
            let index = i + j * width;
            if (board[index] !== newColumn[j]) changed = true;
            board[index] = newColumn[j];
        }
    }
    if (changed) {
        scoreDisplay.innerText = score;
        generate();
        drawBoard();
        checkGameOver();
    }
}

function moveDown() {
    let changed = false;
    for (let i = 0; i < width; i++) {
        let column = [board[i], board[i+width], board[i+width*2], board[i+width*3]];
        let filteredColumn = column.filter(num => num !== 0);
        let missing = width - filteredColumn.length;
        let zeros = Array(missing).fill(0);
        let newColumn = zeros.concat(filteredColumn);

        for (let j = width - 1; j > 0; j--) {
            if (newColumn[j] === newColumn[j - 1] && newColumn[j] !== 0) {
                let combinedValue = newColumn[j] * 2;
                newColumn[j] = combinedValue;
                score += combinedValue;
                newColumn[j - 1] = 0;
            }
        }

        filteredColumn = newColumn.filter(num => num !== 0);
        missing = width - filteredColumn.length;
        zeros = Array(missing).fill(0);
        newColumn = filteredColumn.concat(zeros);

        for (let j = 0; j < width; j++) {
            let index = i + j * width;
            if (board[index] !== newColumn[j]) changed = true;
            board[index] = newColumn[j];
        }
    }
    if (changed) {
        scoreDisplay.innerText = score;
        generate();
        drawBoard();
        checkGameOver();
    }
}

// Écouteur de touches pour les flèches du clavier
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveLeft();
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveRight();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveUp();
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveDown();
    }
});

function checkGameOver() {
    let zeros = board.filter(val => val === 0).length;
    if (zeros === 0) {
        // Vérifier s'il reste des fusions possibles
        let canMerge = false;
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                let current = board[r * 4 + c];
                if (c < 3 && current === board[r * 4 + c + 1]) canMerge = true;
                if (r < 3 && current === board[(r + 1) * 4 + c]) canMerge = true;
            }
        }
        if (!canMerge) {
            setTimeout(() => alert("Plus de mouvements possibles ! Fin de partie."), 200);
        }
    }
}

// Lancer le jeu au chargement
createBoard();
