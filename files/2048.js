let board = [];
let score = 0;
const gridDisplay = document.getElementById('grid-2048');
const scoreDisplay = document.getElementById('score');

function createBoard() {
    board = [
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0]
    ];
    generate();
    generate();
    updateBoard();
}

function generate() {
    let empty = [];
    for (let r=0; r<4; r++) {
        for (let c=0; c<4; c++) {
            if (board[r][c] === 0) empty.push({r, c});
        }
    }
    if (empty.length > 0) {
        let spot = empty[Math.floor(Math.random() * empty.length)];
        board[spot.r][spot.c] = Math.random() < 0.9 ? 2 : 4;
    }
}

function updateBoard() {
    gridDisplay.innerHTML = '';
    for (let r=0; r<4; r++) {
        for (let c=0; c<4; c++) {
            let tile = document.createElement('div');
            tile.classList.add('tile-2048');
            let val = board[r][c];
            tile.innerText = val === 0 ? '' : val;
            if(val > 0) tile.style.backgroundColor = `hsl(${120 - Math.log2(val)*15}, 70%, 40%)`;
            gridDisplay.appendChild(tile);
        }
    }
    scoreDisplay.innerText = score;
}

document.addEventListener('keydown', e => {
    let moved = false;
    if (e.key === 'ArrowLeft') moved = slideLeft();
    else if (e.key === 'ArrowRight') moved = slideRight();
    else if (e.key === 'ArrowUp') moved = slideUp();
    else if (e.key === 'ArrowDown') moved = slideDown();

    if (moved) {
        generate();
        updateBoard();
    }
});

function slideRow(row) {
    let arr = row.filter(val => val);
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i+1]) {
            arr[i] *= 2;
            score += arr[i];
            arr[i+1] = 0;
        }
    }
    arr = arr.filter(val => val);
    while(arr.length < 4) arr.push(0);
    return arr;
}

function slideLeft() {
    let changed = false;
    for(let r=0; r<4; r++) {
        let original = [...board[r]];
        board[r] = slideRow(board[r]);
        if(board[r].some((v, idx) => v !== original[idx])) changed = true;
    }
    return changed;
}

function slideRight() {
    let changed = false;
    for(let r=0; r<4; r++) {
        let original = [...board[r]];
        board[r] = slideRow(board[r].reverse()).reverse();
        if(board[r].some((v, idx) => v !== original[idx])) changed = true;
    }
    return changed;
}

function transpose(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

function slideUp() {
    let t = transpose(board);
    let changed = false;
    for(let r=0; r<4; r++) {
        let original = [...t[r]];
        t[r] = slideRow(t[r]);
        if(t[r].some((v, idx) => v !== original[idx])) changed = true;
    }
    board = transpose(t);
    return changed;
}

function slideDown() {
    let t = transpose(board);
    let changed = false;
    for(let r=0; r<4; r++) {
        let original = [...t[r]];
        t[r] = slideRow(t[r].reverse()).reverse();
        if(t[r].some((v, idx) => v !== original[idx])) changed = true;
    }
    board = transpose(t);
    return changed;
}

createBoard();
