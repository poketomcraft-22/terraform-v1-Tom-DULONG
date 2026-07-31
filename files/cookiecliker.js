let cookies = 0;
let cps = 0;

let cursorCost = 15;
let cursors = 0;

let grandmaCost = 100;
let grandmas = 0;

const scoreEl = document.getElementById('score');
const cpsEl = document.getElementById('cps');
const cookieBtn = document.getElementById('cookieBtn');
const cursorCostEl = document.getElementById('cursorCost');
const grandmaCostEl = document.getElementById('grandmaCost');

cookieBtn.addEventListener('click', () => {
    cookies += 1;
    updateDisplay();
});

function buyCursor() {
    if (cookies >= cursorCost) {
        cookies -= cursorCost;
        cursors += 1;
        cps += 1;
        cursorCost = Math.floor(cursorCost * 1.15);
        updateDisplay();
    }
}

function buyGrandma() {
    if (cookies >= grandmaCost) {
        cookies -= grandmaCost;
        grandmas += 1;
        cps += 5;
        grandmaCost = Math.floor(grandmaCost * 1.15);
        updateDisplay();
    }
}

function resetGame() {
    cookies = 0;
    cps = 0;
    cursorCost = 15;
    cursors = 0;
    grandmaCost = 100;
    grandmas = 0;
    updateDisplay();
}

function updateDisplay() {
    scoreEl.innerText = Math.floor(cookies);
    cpsEl.innerText = cps;
    cursorCostEl.innerText = cursorCost + ' 🍪';
    grandmaCostEl.innerText = grandmaCost + ' 🍪';

    document.getElementById('buyCursor').disabled = cookies < cursorCost;
    document.getElementById('buyGrandma').disabled = cookies < grandmaCost;
}

// Boucle de production automatique (1 fois par seconde)
setInterval(() => {
    cookies += cps;
    updateDisplay();
}, 1000);

updateDisplay();
