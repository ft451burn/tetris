// Tetris Game with Proper Collision Detection
class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.blockSize = 30;
        this.boardWidth = 10;
        this.boardHeight = 20;
        
        // Initialize game board (0 = empty, 1+ = filled with color)
        this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
        
        // Current falling piece
        this.currentPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        
        // Game state
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = true;
        this.dropTime = 1000; // ms
        this.lastDrop = 0;
        
        // Tetris piece definitions
        this.pieces = [
            // I piece
            {
                shape: [
                    [1, 1, 1, 1]
                ],
                color: '#00FFFF'
            },
            // O piece
            {
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: '#FFFF00'
            },
            // T piece
            {
                shape: [
                    [0, 1, 0],
                    [1, 1, 1]
                ],
                color: '#FF00FF'
            },
            // S piece
            {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0]
                ],
                color: '#00FF00'
            },
            // Z piece
            {
                shape: [
                    [1, 1, 0],
                    [0, 1, 1]
                ],
                color: '#FF0000'
            },
            // J piece
            {
                shape: [
                    [1, 0, 0],
                    [1, 1, 1]
                ],
                color: '#0000FF'
            },
            // L piece
            {
                shape: [
                    [0, 0, 1],
                    [1, 1, 1]
                ],
                color: '#FF8000'
            }
        ];
        
        this.init();
    }
    
    init() {
        this.spawnNewPiece();
        this.setupControls();
        this.gameLoop();
    }
    
    spawnNewPiece() {
        const pieceIndex = Math.floor(Math.random() * this.pieces.length);
        this.currentPiece = JSON.parse(JSON.stringify(this.pieces[pieceIndex])); // Deep copy
        this.currentX = Math.floor(this.boardWidth / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.currentY = 0;
        
        // Check if game over
        if (this.isCollision(this.currentPiece.shape, this.currentX, this.currentY)) {
            this.gameRunning = false;
            alert('Game Over! Score: ' + this.score);
        }
    }
    
    // CRITICAL: Proper collision detection function
    isCollision(piece, x, y) {
        for (let row = 0; row < piece.length; row++) {
            for (let col = 0; col < piece[row].length; col++) {
                if (piece[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    // Check boundary collisions
                    if (newX < 0 || newX >= this.boardWidth || newY >= this.boardHeight) {
                        return true;
                    }
                    
                    // Check collision with existing pieces (only if within bounds)
                    if (newY >= 0 && this.board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    // Move piece left
    moveLeft() {
        if (!this.isCollision(this.currentPiece.shape, this.currentX - 1, this.currentY)) {
            this.currentX--;
        }
    }
    
    // Move piece right
    moveRight() {
        if (!this.isCollision(this.currentPiece.shape, this.currentX + 1, this.currentY)) {
            this.currentX++;
        }
    }
    
    // Move piece down
    moveDown() {
        if (!this.isCollision(this.currentPiece.shape, this.currentX, this.currentY + 1)) {
            this.currentY++;
            return true;
        } else {
            this.placePiece();
            return false;
        }
    }
    
    // Hard drop piece
    hardDrop() {
        while (this.moveDown()) {
            // Keep dropping until collision
        }
    }
    
    // Rotate piece (with proper collision checking)
    rotate() {
        const rotated = this.rotatePiece(this.currentPiece.shape);
        
        // Try to place rotated piece at current position
        if (!this.isCollision(rotated, this.currentX, this.currentY)) {
            this.currentPiece.shape = rotated;
            return;
        }
        
        // Try wall kicks (move left/right to accommodate rotation)
        for (let offset = 1; offset <= 2; offset++) {
            // Try moving right
            if (!this.isCollision(rotated, this.currentX + offset, this.currentY)) {
                this.currentPiece.shape = rotated;
                this.currentX += offset;
                return;
            }
            // Try moving left
            if (!this.isCollision(rotated, this.currentX - offset, this.currentY)) {
                this.currentPiece.shape = rotated;
                this.currentX -= offset;
                return;
            }
        }
        
        // If all wall kicks fail, don't rotate
    }
    
    rotatePiece(piece) {
        const rows = piece.length;
        const cols = piece[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                rotated[col][rows - 1 - row] = piece[row][col];
            }
        }
        
        return rotated;
    }
    
    // Place current piece on the board
    placePiece() {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const boardY = this.currentY + row;
                    const boardX = this.currentX + col;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        this.clearLines();
        this.spawnNewPiece();
    }
    
    // Clear completed lines
    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.boardHeight - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(this.boardWidth).fill(0));
                linesCleared++;
                row++; // Check the same row again
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropTime = Math.max(100, 1000 - (this.level - 1) * 100);
            this.updateUI();
        }
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.moveLeft();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.moveRight();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.moveDown();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.rotate();
                    break;
                case ' ':
                    e.preventDefault();
                    this.hardDrop();
                    break;
            }
            this.draw();
        });
    }
    
    gameLoop() {
        const now = Date.now();
        
        if (this.gameRunning && now - this.lastDrop > this.dropTime) {
            this.moveDown();
            this.lastDrop = now;
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let row = 0; row < this.boardHeight; row++) {
            for (let col = 0; col < this.boardWidth; col++) {
                if (this.board[row][col]) {
                    this.drawBlock(col, row, this.board[row][col]);
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            for (let row = 0; row < this.currentPiece.shape.length; row++) {
                for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                    if (this.currentPiece.shape[row][col]) {
                        this.drawBlock(
                            this.currentX + col,
                            this.currentY + row,
                            this.currentPiece.color
                        );
                    }
                }
            }
        }
        
        // Draw grid lines
        this.drawGrid();
    }
    
    drawBlock(x, y, color) {
        const pixelX = x * this.blockSize;
        const pixelY = y * this.blockSize;
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(pixelX, pixelY, this.blockSize, this.blockSize);
        
        // Add border for better visibility
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(pixelX, pixelY, this.blockSize, this.blockSize);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.boardWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.blockSize, 0);
            this.ctx.lineTo(x * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.boardHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.blockSize);
            this.ctx.lineTo(this.canvas.width, y * this.blockSize);
            this.ctx.stroke();
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new TetrisGame();
});