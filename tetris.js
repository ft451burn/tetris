// Konfiguracja gry
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const MOVE_DELAY = 100; // Opóźnienie dla płynnego przesuwania

// Stan gry
let board = [];
let score = 0;
let level = 1;
let lines = 0;
let currentPiece = null;
let gameOver = false;
let isPaused = false;
let dropTime = 1000;
let lastDrop = 0;
let lastMove = 0;
let moveDirection = 0;
let bombs = [];
let explosions = [];

// Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

// Kolory klocków
const COLORS = [
    '#FF0D72', // I - różowy
    '#0DC2FF', // O - jasnoniebieski
    '#0DFF72', // S - zielony
    '#F538FF', // Z - fioletowy
    '#FF8E0D', // L - pomarańczowy
    '#FFE138', // J - żółty
    '#3877FF'  // T - niebieski
];

// Kształty klocków
const SHAPES = [
    [[1, 1, 1, 1]],         // I
    [[1, 1], [1, 1]],       // O
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1, 0], [0, 1, 1]], // Z
    [[1, 0, 0], [1, 1, 1]], // L
    [[0, 0, 1], [1, 1, 1]], // J
    [[0, 1, 0], [1, 1, 1]]  // T
];

// Klasa Bomb
class Bomb {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 0.5;
        this.size = BLOCK_SIZE * 0.8;
        this.fuseTime = 2000; // 2 sekundy
        this.createdAt = Date.now();
        this.exploded = false;
    }
    
    update() {
        if (!this.exploded) {
            this.y += this.speed;
            
            // Sprawdź czy bomba dotknęła klocka lub dna
            const gridY = Math.floor(this.y / BLOCK_SIZE);
            const gridX = Math.floor(this.x / BLOCK_SIZE);
            
            if (gridY >= ROWS - 1 || (gridY >= 0 && board[gridY][gridX])) {
                this.explode();
            }
            
            // Sprawdź czas
            if (Date.now() - this.createdAt > this.fuseTime) {
                this.explode();
            }
        }
    }
    
    explode() {
        if (this.exploded) return;
        this.exploded = true;
        
        // Stwórz efekt wybuchu
        createExplosion(this.x, this.y);
        
        // Zniszcz klocki w promieniu
        const radius = 2;
        const centerX = Math.floor(this.x / BLOCK_SIZE);
        const centerY = Math.floor(this.y / BLOCK_SIZE);
        
        for (let y = Math.max(0, centerY - radius); y <= Math.min(ROWS - 1, centerY + radius); y++) {
            for (let x = Math.max(0, centerX - radius); x <= Math.min(COLS - 1, centerX + radius); x++) {
                const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                if (distance <= radius && board[y][x]) {
                    board[y][x] = 0;
                    score += 10;
                }
            }
        }
    }
    
    draw() {
        if (!this.exploded) {
            // Rysuj bombę
            ctx.save();
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Lont
            ctx.strokeStyle = '#FF6B6B';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.size / 2);
            ctx.lineTo(this.x, this.y - this.size / 2 - 10);
            ctx.stroke();
            
            // Iskra
            const sparkSize = 3 + Math.sin(Date.now() * 0.01) * 2;
            ctx.fillStyle = '#FFD93D';
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.size / 2 - 10, sparkSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }
}

// Klasa Klocka
class Piece {
    constructor(shape, color) {
        this.shape = shape;
        this.color = color;
        this.x = Math.floor((COLS - shape[0].length) / 2);
        this.y = 0;
    }
    
    rotate() {
        const rotated = [];
        const rows = this.shape.length;
        const cols = this.shape[0].length;
        
        for (let i = 0; i < cols; i++) {
            rotated[i] = [];
            for (let j = rows - 1; j >= 0; j--) {
                rotated[i][rows - 1 - j] = this.shape[j][i];
            }
        }
        
        return rotated;
    }
}

// Inicjalizacja planszy
function initBoard() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
}

// Tworzenie nowego klocka
function createPiece() {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    return new Piece(SHAPES[shapeIndex], COLORS[shapeIndex]);
}

// Sprawdzanie kolizji
function isValidMove(piece, dx = 0, dy = 0, newShape = null) {
    const shape = newShape || piece.shape;
    const newX = piece.x + dx;
    const newY = piece.y + dy;
    
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const boardX = newX + x;
                const boardY = newY + y;
                
                if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
                    return false;
                }
                
                if (boardY >= 0 && board[boardY][boardX]) {
                    return false;
                }
            }
        }
    }
    
    return true;
}

// Umieszczanie klocka na planszy
function placePiece(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                const boardY = piece.y + y;
                const boardX = piece.x + x;
                if (boardY >= 0) {
                    board[boardY][boardX] = piece.color;
                }
            }
        }
    }
}

// Usuwanie pełnych linii
function clearLines() {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++;
        }
    }
    
    if (linesCleared > 0) {
        lines += linesCleared;
        score += linesCleared * 100 * level;
        
        // Zwiększ poziom co 10 linii
        if (lines >= level * 10) {
            level++;
            dropTime = Math.max(100, dropTime - 100);
        }
        
        updateScore();
    }
}

// Aktualizacja wyniku
function updateScore() {
    document.getElementById('score').textContent = `Punkty: ${score}`;
    document.getElementById('level').textContent = `Poziom: ${level}`;
    document.getElementById('lines').textContent = `Linie: ${lines}`;
}

// Rysowanie planszy
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Rysuj siatkę
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(canvas.width, y * BLOCK_SIZE);
        ctx.stroke();
    }
    
    // Rysuj klocki na planszy
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x]);
            }
        }
    }
}

// Rysowanie pojedynczego bloku
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // Efekt 3D
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x * BLOCK_SIZE + 2, y * BLOCK_SIZE + 2, BLOCK_SIZE - 4, 4);
    ctx.fillRect(x * BLOCK_SIZE + 2, y * BLOCK_SIZE + 2, 4, BLOCK_SIZE - 4);
}

// Rysowanie aktualnego klocka
function drawPiece(piece) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                drawBlock(piece.x + x, piece.y + y, piece.color);
            }
        }
    }
}

// Rysowanie cienia klocka
function drawGhost(piece) {
    let ghostY = piece.y;
    while (isValidMove(piece, 0, ghostY - piece.y + 1)) {
        ghostY++;
    }
    
    ctx.save();
    ctx.globalAlpha = 0.3;
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                drawBlock(piece.x + x, ghostY + y, piece.color);
            }
        }
    }
    ctx.restore();
}

// Tworzenie efektu wybuchu
function createExplosion(x, y) {
    explosions.push({
        x: x,
        y: y,
        radius: 0,
        maxRadius: BLOCK_SIZE * 3,
        particles: []
    });
    
    // Dodaj cząsteczki
    for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        const speed = 2 + Math.random() * 3;
        explosions[explosions.length - 1].particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 4,
            color: `hsl(${Math.random() * 60}, 100%, 50%)`
        });
    }
}

// Rysowanie eksplozji
function drawExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        
        // Rysuj okrąg wybuchu
        ctx.save();
        ctx.globalAlpha = 1 - (explosion.radius / explosion.maxRadius);
        ctx.strokeStyle = '#FFD93D';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Rysuj cząsteczki
        for (const particle of explosion.particles) {
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = 1 - (explosion.radius / explosion.maxRadius);
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Aktualizuj pozycję cząsteczki
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // Grawitacja
            particle.size *= 0.95; // Zmniejszanie
        }
        ctx.restore();
        
        // Aktualizuj promień
        explosion.radius += 5;
        
        // Usuń zakończone eksplozje
        if (explosion.radius >= explosion.maxRadius) {
            explosions.splice(i, 1);
        }
    }
}

// Generowanie bomb
function spawnBomb() {
    // Szansa na bombę zależy od poziomu
    if (Math.random() < 0.001 * level) {
        const x = Math.random() * (COLS - 1) * BLOCK_SIZE + BLOCK_SIZE / 2;
        bombs.push(new Bomb(x, 0));
    }
}

// Główna pętla gry
function gameLoop(currentTime) {
    if (!gameOver && !isPaused) {
        // Aktualizuj bomby
        spawnBomb();
        for (let i = bombs.length - 1; i >= 0; i--) {
            bombs[i].update();
            if (bombs[i].exploded) {
                bombs.splice(i, 1);
            }
        }
        
        // Automatyczne opadanie
        if (currentTime - lastDrop > dropTime) {
            if (isValidMove(currentPiece, 0, 1)) {
                currentPiece.y++;
            } else {
                placePiece(currentPiece);
                clearLines();
                currentPiece = createPiece();
                
                if (!isValidMove(currentPiece)) {
                    gameOver = true;
                    alert(`Koniec gry! Twój wynik: ${score}`);
                    return;
                }
            }
            lastDrop = currentTime;
        }
        
        // Płynne przesuwanie w lewo/prawo
        if (moveDirection !== 0 && currentTime - lastMove > MOVE_DELAY) {
            if (isValidMove(currentPiece, moveDirection, 0)) {
                currentPiece.x += moveDirection;
                lastMove = currentTime;
            }
        }
    }
    
    // Rysowanie
    drawBoard();
    if (currentPiece) {
        drawGhost(currentPiece);
        drawPiece(currentPiece);
    }
    
    // Rysuj bomby
    for (const bomb of bombs) {
        bomb.draw();
    }
    
    // Rysuj eksplozje
    drawExplosions();
    
    requestAnimationFrame(gameLoop);
}

// Obsługa klawiatury
let keys = {};

document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    
    keys[e.key] = true;
    
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            moveDirection = -1;
            if (isValidMove(currentPiece, -1, 0)) {
                currentPiece.x--;
                lastMove = Date.now();
            }
            break;
            
        case 'ArrowRight':
            e.preventDefault();
            moveDirection = 1;
            if (isValidMove(currentPiece, 1, 0)) {
                currentPiece.x++;
                lastMove = Date.now();
            }
            break;
            
        case 'ArrowDown':
            e.preventDefault();
            if (isValidMove(currentPiece, 0, 1)) {
                currentPiece.y++;
                score++;
                updateScore();
            }
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            const rotated = currentPiece.rotate();
            if (isValidMove(currentPiece, 0, 0, rotated)) {
                currentPiece.shape = rotated;
            } else {
                // Próba wall kick
                for (let offset of [-1, 1, -2, 2]) {
                    if (isValidMove(currentPiece, offset, 0, rotated)) {
                        currentPiece.x += offset;
                        currentPiece.shape = rotated;
                        break;
                    }
                }
            }
            break;
            
        case ' ':
            e.preventDefault();
            while (isValidMove(currentPiece, 0, 1)) {
                currentPiece.y++;
                score += 2;
            }
            updateScore();
            break;
            
        case 'p':
        case 'P':
            isPaused = !isPaused;
            break;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        moveDirection = 0;
    }
});

// Inicjalizacja gry
function init() {
    initBoard();
    currentPiece = createPiece();
    updateScore();
    requestAnimationFrame(gameLoop);
}

// Start gry
init();