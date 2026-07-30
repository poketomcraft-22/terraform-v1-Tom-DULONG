const canvas = document.getElementById("tetrisCanvas");
const ctx = canvas.getContext("2d");
const ROW = 20;
const COL = 10;
const SQ = 20; // Taille d'un carré en pixels
const VACANT = "BLACK"; // Couleur d'une case vide

// Dessiner un carré
function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SQ, y * SQ, SQ, SQ);
    ctx.strokeStyle = "#30363d";
    ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

// Créer le plateau du jeu vide
let board = [];
for (let r = 0; r < ROW; r++) {
    board[r] = [];
    for (let c = 0; c < COL; c++) {
        board[r][c] = VACANT;
    }
}

// Afficher le plateau
function drawBoard() {
    for (let r = 0; r < ROW; r++) {
        for (let c = 0; c < COL; c++) {
            drawSquare(c, r, board[r][c]);
        }
    }
}

drawBoard();
