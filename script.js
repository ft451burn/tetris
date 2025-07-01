// Konfiguracja gry
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

// Kolory klocków
const COLORS = [
    '#000000', // pusty
    '#FF0D72', // I
    '#0DC2FF', // O
    '#0DFF72', // T
    '#F538FF', // S
    '#FF8E0D', // Z
    '#FFE138', // J
    '#3877FF'  // L
];

// Kształty klocków Tetris
const TETROMINOS = [
    [], // pusty
    [ // I
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
    ],
    [ // O
        [2,2],
        [2,2]
    ],
    [ // T
        [0,3,0],
        [3,3,3],
        [0,0,0]
    ],
    [ // S
        [0,4,4],
        [4,4,0],
        [0,0,0]
    ],
    [ // Z
        [5,5,0],
        [0,5,5],
        [0,0,0]
    ],
    [ // J
        [6,0,0],
        [6,6,6],
        [0,0,0]
    ],
    [ // L
        [0,0,7],
        [7,7,7],
        [0,0,0]
    ]
];

// Zmienne gry
let canvas, ctx, nextCanvas, nextCtx;
let board = [];
let currentPiece = null;
let nextPiece = null;
let gameRunning = false;
let gameSpeed = 500;
let lastTime = 0;
let score = 0;
let level = 1;
let lines = 0;
let isPaused = false;

// Inicjalizacja gry
function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('next-canvas');
    nextCtx = nextCanvas.getContext('2d');
    
    // Inicjalizacja planszy
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        board[y] = [];
        for (let x = 0; x < BOARD_WIDTH; x++) {
            board[y][x] = 0;
        }
    }
    
    // Event listenery
    document.addEventListener('keydown', handleKeyPress);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    
    startGame();
}

// Rozpoczęcie gry
function startGame() {
    gameRunning = true;
    isPaused = false;
    score = 0;
    level = 1;
    lines = 0;
    gameSpeed = 500;
    
    // Wyczyść planszę
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            board[y][x] = 0;
        }
    }
    
    currentPiece = createPiece();
    nextPiece = createPiece();
    
    updateScore();
    document.getElementById('game-over').classList.add('hidden');
    
    gameLoop();
}

// Restart gry
function restartGame() {
    startGame();
}

// Tworzenie nowego klocka
function createPiece() {
    const type = Math.floor(Math.random() * 7) + 1;
    return {
        type: type,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOS[type][0].length / 2),
        y: 0,
        rotation: 0
    };
}

// Główna pętla gry
function gameLoop(currentTime = 0) {
    if (!gameRunning || isPaused) {
        if (gameRunning) {
            requestAnimationFrame(gameLoop);
        }
        return;
    }
    
    const deltaTime = currentTime - lastTime;
    
    if (deltaTime > gameSpeed) {
        update();
        lastTime = currentTime;
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// Aktualizacja logiki gry
function update() {
    if (!movePiece(0, 1)) {
        placePiece();
        clearLines();
        currentPiece = nextPiece;
        nextPiece = createPiece();
        
        if (!isValidMove(currentPiece, 0, 0, 0)) {
            gameOver();
        }
    }
}

// Rysowanie gry
function draw() {
    // Wyczyść canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Rysuj planszę
    drawBoard();
    
    // Rysuj aktualny klocek
    if (currentPiece) {
        drawPiece(currentPiece);
    }
    
    // Rysuj cień klocka
    if (currentPiece) {
        drawGhost();
    }
    
    // Rysuj następny klocek
    drawNextPiece();
}

// Rysowanie planszy
function drawBoard() {
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x] !== 0) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }
}

// Rysowanie klocka
function drawPiece(piece) {
    const shape = TETROMINOS[piece.type];
    const rotatedShape = getRotatedShape(shape, piece.rotation);
    
    for (let y = 0; y < rotatedShape.length; y++) {
        for (let x = 0; x < rotatedShape[y].length; x++) {
            if (rotatedShape[y][x] !== 0) {
                drawBlock(piece.x + x, piece.y + y, piece.type);
            }
        }
    }
}

// Rysowanie cienia klocka
function drawGhost() {
    const ghostY = getGhostY();
    const shape = TETROMINOS[currentPiece.type];
    const rotatedShape = getRotatedShape(shape, currentPiece.rotation);
    
    ctx.globalAlpha = 0.3;
    for (let y = 0; y < rotatedShape.length; y++) {
        for (let x = 0; x < rotatedShape[y].length; x++) {
            if (rotatedShape[y][x] !== 0) {
                drawBlock(currentPiece.x + x, ghostY + y, currentPiece.type);
            }
        }
    }
    ctx.globalAlpha = 1;
}

// Obliczanie pozycji cienia
function getGhostY() {
    let ghostY = currentPiece.y;
    while (isValidMove(currentPiece, 0, ghostY - currentPiece.y + 1, 0)) {
        ghostY++;
    }
    return ghostY;
}

// Rysowanie pojedynczego bloku
function drawBlock(x, y, type) {
    const pixelX = x * BLOCK_SIZE;
    const pixelY = y * BLOCK_SIZE;
    
    ctx.fillStyle = COLORS[type];
    ctx.fillRect(pixelX, pixelY, BLOCK_SIZE, BLOCK_SIZE);
    
    // Dodaj obramowanie
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(pixelX, pixelY, BLOCK_SIZE, BLOCK_SIZE);
}

// Rysowanie następnego klocka
function drawNextPiece() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
        const shape = TETROMINOS[nextPiece.type];
        const blockSize = 20;
        const offsetX = (nextCanvas.width - shape[0].length * blockSize) / 2;
        const offsetY = (nextCanvas.height - shape.length * blockSize) / 2;
        
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] !== 0) {
                    nextCtx.fillStyle = COLORS[nextPiece.type];
                    nextCtx.fillRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize,
                        blockSize
                    );
                    nextCtx.strokeStyle = '#fff';
                    nextCtx.strokeRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize,
                        blockSize
                    );
                }
            }
        }
    }
}

// Poruszanie klockiem
function movePiece(dx, dy) {
    if (isValidMove(currentPiece, dx, dy, 0)) {
        currentPiece.x += dx;
        currentPiece.y += dy;
        return true;
    }
    return false;
}

// Obracanie klocka
function rotatePiece() {
    const newRotation = (currentPiece.rotation + 1) % 4;
    if (isValidMove(currentPiece, 0, 0, newRotation)) {
        currentPiece.rotation = newRotation;
    }
}

// Sprawdzanie poprawności ruchu
function isValidMove(piece, dx, dy, rotation) {
    const newX = piece.x + dx;
    const newY = piece.y + dy;
    const shape = TETROMINOS[piece.type];
    const rotatedShape = getRotatedShape(shape, rotation);
    
    for (let y = 0; y < rotatedShape.length; y++) {
        for (let x = 0; x < rotatedShape[y].length; x++) {
            if (rotatedShape[y][x] !== 0) {
                const boardX = newX + x;
                const boardY = newY + y;
                
                if (boardX < 0 || boardX >= BOARD_WIDTH || 
                    boardY >= BOARD_HEIGHT || 
                    (boardY >= 0 && board[boardY][boardX] !== 0)) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Obracanie kształtu
function getRotatedShape(shape, rotation) {
    let rotatedShape = shape;
    for (let i = 0; i < rotation; i++) {
        rotatedShape = rotateMatrix(rotatedShape);
    }
    return rotatedShape;
}

// Obracanie macierzy o 90 stopni
function rotateMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = [];
    
    for (let i = 0; i < cols; i++) {
        rotated[i] = [];
        for (let j = 0; j < rows; j++) {
            rotated[i][j] = matrix[rows - 1 - j][i];
        }
    }
    return rotated;
}

// Umieszczanie klocka na planszy
function placePiece() {
    const shape = TETROMINOS[currentPiece.type];
    const rotatedShape = getRotatedShape(shape, currentPiece.rotation);
    
    for (let y = 0; y < rotatedShape.length; y++) {
        for (let x = 0; x < rotatedShape[y].length; x++) {
            if (rotatedShape[y][x] !== 0) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.type;
                }
            }
        }
    }
}

// Usuwanie pełnych linii
function clearLines() {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (isLineFull(y)) {
            removeLine(y);
            linesCleared++;
            y++; // Sprawdź tę samą linię ponownie
        }
    }
    
    if (linesCleared > 0) {
        updateScore(linesCleared);
    }
}

// Sprawdzanie czy linia jest pełna
function isLineFull(y) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x] === 0) {
            return false;
        }
    }
    return true;
}

// Usuwanie linii
function removeLine(lineY) {
    for (let y = lineY; y > 0; y--) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            board[y][x] = board[y - 1][x];
        }
    }
    
    // Wyczyść górną linię
    for (let x = 0; x < BOARD_WIDTH; x++) {
        board[0][x] = 0;
    }
}

// Aktualizacja wyniku
function updateScore(linesCleared = 0) {
    if (linesCleared > 0) {
        lines += linesCleared;
        const points = [0, 40, 100, 300, 1200][linesCleared] * level;
        score += points;
        
        // Zwiększ poziom co 10 linii
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            gameSpeed = Math.max(50, 500 - (level - 1) * 50);
        }
    }
    
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

// Koniec gry
function gameOver() {
    gameRunning = false;
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').classList.remove('hidden');
}

// Obsługa klawiatury
function handleKeyPress(event) {
    if (!gameRunning) return;
    
    switch (event.code) {
        case 'ArrowLeft':
            event.preventDefault();
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            event.preventDefault();
            movePiece(1, 0);
            break;
        case 'ArrowDown':
            event.preventDefault();
            movePiece(0, 1);
            break;
        case 'ArrowUp':
            event.preventDefault();
            rotatePiece();
            break;
        case 'Space':
            event.preventDefault();
            togglePause();
            break;
    }
}

// Pauza
function togglePause() {
    isPaused = !isPaused;
    if (!isPaused) {
        gameLoop();
    }
}

// Uruchomienie gry po załadowaniu strony
window.addEventListener('load', init);