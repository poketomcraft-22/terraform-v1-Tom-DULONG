const cells = document.querySelectorAll('.morpion-cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restartMorpion');
let board = ['', '', '', '', '', '', '', '', ''];
let isGameActive = true;
const winningConditions = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];

cells.forEach(cell => cell.addEventListener('click', cellClicked));
restartBtn.addEventListener('click', restartGame);

function cellClicked() {
    const index = this.getAttribute('data-index');
    if (board[index] !== '' || !isGameActive) return;

    board[index] = 'X';
    this.innerText = 'X';
    this.style.color = '#00ff87';

    if (checkWin('X')) {
        statusText.innerText = '🎉 Tu as gagné !';
        endGame();
        return;
    }
    if (board.every(cell => cell !== '')) {
        statusText.innerText = '🤝 Match nul !';
        endGame();
        return;
    }

    statusText.innerText = "Réflexion du Bot...";
    isGameActive = false;
    setTimeout(botMove, 500);
}

function botMove() {
    let emptyCells = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
    if (emptyCells.length === 0) return;

    let move = findBestMove('O') || findBestMove('X') || emptyCells[Math.floor(Math.random() * emptyCells.length)];

    board[move] = 'O';
    cells[move].innerText = 'O';
    cells[move].style.color = '#ff0055';

    if (checkWin('O')) {
        statusText.innerText = '🤖 Le Bot a gagné !';
        endGame();
        return;
    }
    if (board.every(cell => cell !== '')) {
        statusText.innerText = '🤝 Match nul !';
        endGame();
        return;
    }

    statusText.innerText = 'À toi de jouer !';
    isGameActive = true;
}

function findBestMove(playerSymbol) {
    for (let condition of winningConditions) {
        let [a, b, c] = condition;
        let vals = [board[a], board[b], board[c]];
        if (vals.filter(v => v === playerSymbol).length === 2 && vals.includes('')) {
            return condition[vals.indexOf('')];
        }
    }
    return null;
}

function checkWin(symbol) {
    return winningConditions.some(condition => {
        return condition.every(index => board[index] === symbol);
    });
}

function endGame() {
    isGameActive = false;
    restartBtn.classList.remove('hidden');
}

function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    statusText.innerText = 'À toi de jouer !';
    restartBtn.classList.add('hidden');
    cells.forEach(cell => { cell.innerText = ''; });
}
