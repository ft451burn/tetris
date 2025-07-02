// Tetris Game with Advanced Collision Detection and Testing
class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        // Game board dimensions
        this.COLS = 10;
        this.ROWS = 20;
        this.BLOCK_SIZE = 30;
        
        // Game state
        this.board = this.createBoard();
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.dropTime = 0;
        this.dropInterval = 1000; // milliseconds
        
        // Colors for different tetromino types
        this.colors = {
            0: '#000000', // Empty
            1: '#FF6B6B', // I piece - Red
            2: '#4ECDC4', // O piece - Cyan
            3: '#45B7D1', // T piece - Blue
            4: '#96CEB4', // S piece - Green
            5: '#FFEAA7', // Z piece - Yellow
            6: '#DDA0DD', // J piece - Purple
            7: '#F39C12'  // L piece - Orange
        };
        
        // Tetromino definitions with all rotation states
        this.tetrominoes = {
            I: {
                shape: [
                    [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // 0°
                    [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]], // 90°
                    [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]], // 180°
                    [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]]  // 270°
                ],
                color: 1
            },
            O: {
                shape: [
                    [[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]], // All rotations same
                    [[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]],
                    [[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]],
                    [[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]
                ],
                color: 2
            },
            T: {
                shape: [
                    [[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]], // 0°
                    [[0,1,0,0],[0,1,1,0],[0,1,0,0],[0,0,0,0]], // 90°
                    [[0,0,0,0],[1,1,1,0],[0,1,0,0],[0,0,0,0]], // 180°
                    [[0,1,0,0],[1,1,0,0],[0,1,0,0],[0,0,0,0]]  // 270°
                ],
                color: 3
            },
            S: {
                shape: [
                    [[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]], // 0°
                    [[0,1,0,0],[0,1,1,0],[0,0,1,0],[0,0,0,0]], // 90°
                    [[0,0,0,0],[0,1,1,0],[1,1,0,0],[0,0,0,0]], // 180°
                    [[1,0,0,0],[1,1,0,0],[0,1,0,0],[0,0,0,0]]  // 270°
                ],
                color: 4
            },
            Z: {
                shape: [
                    [[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]], // 0°
                    [[0,0,1,0],[0,1,1,0],[0,1,0,0],[0,0,0,0]], // 90°
                    [[0,0,0,0],[1,1,0,0],[0,1,1,0],[0,0,0,0]], // 180°
                    [[0,1,0,0],[1,1,0,0],[1,0,0,0],[0,0,0,0]]  // 270°
                ],
                color: 5
            },
            J: {
                shape: [
                    [[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]], // 0°
                    [[0,1,1,0],[0,1,0,0],[0,1,0,0],[0,0,0,0]], // 90°
                    [[0,0,0,0],[1,1,1,0],[0,0,1,0],[0,0,0,0]], // 180°
                    [[0,1,0,0],[0,1,0,0],[1,1,0,0],[0,0,0,0]]  // 270°
                ],
                color: 6
            },
            L: {
                shape: [
                    [[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]], // 0°
                    [[0,1,0,0],[0,1,0,0],[0,1,1,0],[0,0,0,0]], // 90°
                    [[0,0,0,0],[1,1,1,0],[1,0,0,0],[0,0,0,0]], // 180°
                    [[1,1,0,0],[0,1,0,0],[0,1,0,0],[0,0,0,0]]  // 270°
                ],
                color: 7
            }
        };
        
        // Wall kick data for SRS (Super Rotation System)
        this.wallKickData = {
            I: {
                '0->1': [[-2,0],[ 1,0],[-2,-1],[ 1, 2]],
                '1->0': [[ 2,0],[-1,0],[ 2, 1],[-1,-2]],
                '1->2': [[-1,0],[ 2,0],[-1, 2],[ 2,-1]],
                '2->1': [[ 1,0],[-2,0],[ 1,-2],[-2, 1]],
                '2->3': [[ 2,0],[-1,0],[ 2, 1],[-1,-2]],
                '3->2': [[-2,0],[ 1,0],[-2,-1],[ 1, 2]],
                '3->0': [[ 1,0],[-2,0],[ 1,-2],[-2, 1]],
                '0->3': [[-1,0],[ 2,0],[-1, 2],[ 2,-1]]
            },
            JLSTZ: {
                '0->1': [[-1,0],[-1, 1],[0,-2],[-1,-2]],
                '1->0': [[ 1,0],[ 1,-1],[0, 2],[ 1, 2]],
                '1->2': [[ 1,0],[ 1,-1],[0, 2],[ 1, 2]],
                '2->1': [[-1,0],[-1, 1],[0,-2],[-1,-2]],
                '2->3': [[ 1,0],[ 1, 1],[0,-2],[ 1,-2]],
                '3->2': [[-1,0],[-1,-1],[0, 2],[-1, 2]],
                '3->0': [[-1,0],[-1,-1],[0, 2],[-1, 2]],
                '0->3': [[ 1,0],[ 1, 1],[0,-2],[ 1,-2]]
            }
        };
        
        this.init();
    }
    
    createBoard() {
        return Array(this.ROWS).fill().map(() => Array(this.COLS).fill(0));
    }
    
    init() {
        this.spawnPiece();
        this.spawnNextPiece();
        this.bindEvents();
        this.gameLoop();
    }
    
    spawnPiece() {
        if (this.nextPiece) {
            this.currentPiece = this.nextPiece;
        } else {
            this.currentPiece = this.createRandomPiece();
        }
        this.currentPiece.x = Math.floor(this.COLS / 2) - 2;
        this.currentPiece.y = 0;
        this.currentPiece.rotation = 0;
        
        // Check for game over
        if (this.checkCollision(this.currentPiece, 0, 0, 0)) {
            this.gameOver = true;
            this.showGameOver();
        }
    }
    
    spawnNextPiece() {
        this.nextPiece = this.createRandomPiece();
        this.drawNextPiece();
    }
    
    createRandomPiece() {
        const types = Object.keys(this.tetrominoes);
        const randomType = types[Math.floor(Math.random() * types.length)];
        return {
            type: randomType,
            shape: this.tetrominoes[randomType].shape,
            color: this.tetrominoes[randomType].color,
            x: 0,
            y: 0,
            rotation: 0
        };
    }
    
    // ADVANCED COLLISION DETECTION SYSTEM
    checkCollision(piece, deltaX, deltaY, newRotation) {
        const newX = piece.x + deltaX;
        const newY = piece.y + deltaY;
        const shape = piece.shape[newRotation !== undefined ? newRotation : piece.rotation];
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const boardX = newX + col;
                    const boardY = newY + row;
                    
                    // Check boundaries
                    if (boardX < 0 || boardX >= this.COLS || 
                        boardY < 0 || boardY >= this.ROWS) {
                        return true;
                    }
                    
                    // Check board collision
                    if (this.board[boardY] && this.board[boardY][boardX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    // ADVANCED ROTATION WITH WALL KICKS
    rotatePiece() {
        if (!this.currentPiece || this.gameOver || this.paused) return;
        
        const newRotation = (this.currentPiece.rotation + 1) % 4;
        
        // First try rotation without wall kicks
        if (!this.checkCollision(this.currentPiece, 0, 0, newRotation)) {
            this.currentPiece.rotation = newRotation;
            return true;
        }
        
        // Try wall kicks
        const kickData = this.getWallKickData(this.currentPiece.type, this.currentPiece.rotation, newRotation);
        
        for (let i = 0; i < kickData.length; i++) {
            const [kickX, kickY] = kickData[i];
            if (!this.checkCollision(this.currentPiece, kickX, kickY, newRotation)) {
                this.currentPiece.x += kickX;
                this.currentPiece.y += kickY;
                this.currentPiece.rotation = newRotation;
                return true;
            }
        }
        
        return false; // Rotation failed
    }
    
    getWallKickData(pieceType, oldRotation, newRotation) {
        const key = `${oldRotation}->${newRotation}`;
        
        if (pieceType === 'I') {
            return this.wallKickData.I[key] || [[0,0]];
        } else if (pieceType === 'O') {
            return [[0,0]]; // O piece doesn't need wall kicks
        } else {
            return this.wallKickData.JLSTZ[key] || [[0,0]];
        }
    }
    
    movePiece(deltaX, deltaY) {
        if (!this.currentPiece || this.gameOver || this.paused) return false;
        
        if (!this.checkCollision(this.currentPiece, deltaX, deltaY)) {
            this.currentPiece.x += deltaX;
            this.currentPiece.y += deltaY;
            return true;
        }
        return false;
    }
    
    dropPiece() {
        if (!this.movePiece(0, 1)) {
            this.lockPiece();
            this.clearLines();
            this.spawnPiece();
            this.spawnNextPiece();
        }
    }
    
    hardDrop() {
        if (!this.currentPiece || this.gameOver || this.paused) return;
        
        let dropDistance = 0;
        while (this.movePiece(0, 1)) {
            dropDistance++;
        }
        
        this.score += dropDistance * 2; // Bonus for hard drop
        this.lockPiece();
        this.clearLines();
        this.spawnPiece();
        this.spawnNextPiece();
    }
    
    lockPiece() {
        const shape = this.currentPiece.shape[this.currentPiece.rotation];
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const boardX = this.currentPiece.x + col;
                    const boardY = this.currentPiece.y + row;
                    
                    if (boardY >= 0 && boardY < this.ROWS && 
                        boardX >= 0 && boardX < this.COLS) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.ROWS - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(this.COLS).fill(0));
                linesCleared++;
                row++; // Check the same row again
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 100);
            
            // Scoring system
            const scores = [0, 100, 300, 500, 800];
            this.score += scores[linesCleared] * this.level;
            
            this.updateUI();
        }
    }
    
    // RENDERING METHODS
    draw() {
        this.clearCanvas();
        this.drawBoard();
        this.drawCurrentPiece();
        this.drawGhost();
    }
    
    clearCanvas() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawBoard() {
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                if (this.board[row][col]) {
                    this.drawBlock(col, row, this.colors[this.board[row][col]]);
                }
            }
        }
    }
    
    drawCurrentPiece() {
        if (!this.currentPiece) return;
        
        const shape = this.currentPiece.shape[this.currentPiece.rotation];
        const color = this.colors[this.currentPiece.color];
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    this.drawBlock(
                        this.currentPiece.x + col,
                        this.currentPiece.y + row,
                        color
                    );
                }
            }
        }
    }
    
    drawGhost() {
        if (!this.currentPiece) return;
        
        // Find ghost position
        let ghostY = this.currentPiece.y;
        while (!this.checkCollision(this.currentPiece, 0, ghostY - this.currentPiece.y + 1)) {
            ghostY++;
        }
        
        const shape = this.currentPiece.shape[this.currentPiece.rotation];
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    this.drawGhostBlock(
                        this.currentPiece.x + col,
                        ghostY + row
                    );
                }
            }
        }
    }
    
    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * this.BLOCK_SIZE,
            y * this.BLOCK_SIZE,
            this.BLOCK_SIZE,
            this.BLOCK_SIZE
        );
        
        // Add border
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
            x * this.BLOCK_SIZE,
            y * this.BLOCK_SIZE,
            this.BLOCK_SIZE,
            this.BLOCK_SIZE
        );
    }
    
    drawGhostBlock(x, y) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(
            x * this.BLOCK_SIZE,
            y * this.BLOCK_SIZE,
            this.BLOCK_SIZE,
            this.BLOCK_SIZE
        );
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
            x * this.BLOCK_SIZE,
            y * this.BLOCK_SIZE,
            this.BLOCK_SIZE,
            this.BLOCK_SIZE
        );
    }
    
    drawNextPiece() {
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (!this.nextPiece) return;
        
        const shape = this.nextPiece.shape[0];
        const color = this.colors[this.nextPiece.color];
        const blockSize = 20;
        const offsetX = 20;
        const offsetY = 20;
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    this.nextCtx.fillStyle = color;
                    this.nextCtx.fillRect(
                        offsetX + col * blockSize,
                        offsetY + row * blockSize,
                        blockSize,
                        blockSize
                    );
                    
                    this.nextCtx.strokeStyle = '#333';
                    this.nextCtx.lineWidth = 1;
                    this.nextCtx.strokeRect(
                        offsetX + col * blockSize,
                        offsetY + row * blockSize,
                        blockSize,
                        blockSize
                    );
                }
            }
        }
    }
    
    // EVENT HANDLING
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver || this.paused) return;
            
            switch(e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.rotatePiece();
                    break;
                case 'Space':
                    e.preventDefault();
                    this.hardDrop();
                    break;
                case 'KeyP':
                    e.preventDefault();
                    this.togglePause();
                    break;
            }
        });
    }
    
    togglePause() {
        this.paused = !this.paused;
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lines').textContent = this.lines;
        document.getElementById('level').textContent = this.level;
    }
    
    showGameOver() {
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').style.display = 'flex';
    }
    
    restart() {
        this.board = this.createBoard();
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        this.dropTime = 0;
        this.dropInterval = 1000;
        
        document.getElementById('gameOverScreen').style.display = 'none';
        this.updateUI();
        this.spawnPiece();
        this.spawnNextPiece();
    }
    
    // GAME LOOP
    gameLoop() {
        const currentTime = Date.now();
        
        if (!this.gameOver && !this.paused) {
            if (currentTime - this.dropTime > this.dropInterval) {
                this.dropPiece();
                this.dropTime = currentTime;
            }
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// COMPREHENSIVE TESTING SYSTEM
class TetrisTestSuite {
    constructor(game) {
        this.game = game;
        this.testResults = [];
    }
    
    log(message, passed = true) {
        const result = `${passed ? '✓' : '✗'} ${message}`;
        this.testResults.push(result);
        console.log(result);
    }
    
    runAllTests() {
        this.testResults = [];
        this.log('=== Starting Collision Tests ===');
        
        this.testBasicCollisions();
        this.testRotationCollisions();
        this.testWallKicks();
        this.testBoundaryCollisions();
        this.testComplexScenarios();
        
        this.displayResults();
        return this.testResults;
    }
    
    testBasicCollisions() {
        this.log('--- Basic Collision Tests ---');
        
        // Test floor collision
        const testPiece = this.game.createRandomPiece();
        testPiece.x = 5;
        testPiece.y = this.game.ROWS - 1;
        const floorCollision = this.game.checkCollision(testPiece, 0, 1);
        this.log('Floor collision detection', floorCollision);
        
        // Test wall collisions
        testPiece.x = -1;
        testPiece.y = 5;
        const leftWallCollision = this.game.checkCollision(testPiece, 0, 0);
        this.log('Left wall collision detection', leftWallCollision);
        
        testPiece.x = this.game.COLS;
        const rightWallCollision = this.game.checkCollision(testPiece, 0, 0);
        this.log('Right wall collision detection', rightWallCollision);
        
        // Test piece-to-piece collision
        this.game.board[10][5] = 1; // Place a block
        testPiece.x = 4;
        testPiece.y = 9;
        const pieceCollision = this.game.checkCollision(testPiece, 1, 1);
        this.log('Piece-to-piece collision detection', pieceCollision);
        this.game.board[10][5] = 0; // Clean up
    }
    
    testRotationCollisions() {
        this.log('--- Rotation Collision Tests ---');
        
        // Test all piece types and rotations
        const pieceTypes = Object.keys(this.game.tetrominoes);
        
        for (let pieceType of pieceTypes) {
            for (let rotation = 0; rotation < 4; rotation++) {
                const testPiece = {
                    type: pieceType,
                    shape: this.game.tetrominoes[pieceType].shape,
                    color: this.game.tetrominoes[pieceType].color,
                    x: 5,
                    y: 5,
                    rotation: rotation
                };
                
                // Test rotation in open space (should succeed)
                const openSpaceRotation = !this.game.checkCollision(testPiece, 0, 0, (rotation + 1) % 4);
                this.log(`${pieceType} rotation ${rotation}→${(rotation + 1) % 4} in open space`, openSpaceRotation);
                
                // Test rotation near wall
                testPiece.x = 0;
                const nearWallResult = this.testRotationNearWall(testPiece, rotation);
                this.log(`${pieceType} rotation near wall handled correctly`, nearWallResult);
            }
        }
    }
    
    testRotationNearWall(piece, rotation) {
        const originalRotation = piece.rotation;
        piece.rotation = rotation;
        
        // Simulate rotation attempt
        const newRotation = (rotation + 1) % 4;
        
        // Check if rotation would cause collision
        if (this.game.checkCollision(piece, 0, 0, newRotation)) {
            // Try wall kicks
            const kickData = this.game.getWallKickData(piece.type, rotation, newRotation);
            let kickWorked = false;
            
            for (let [kickX, kickY] of kickData) {
                if (!this.game.checkCollision(piece, kickX, kickY, newRotation)) {
                    kickWorked = true;
                    break;
                }
            }
            
            return kickWorked || piece.type === 'O'; // O piece doesn't need kicks
        }
        
        return true; // Rotation succeeded without kicks
    }
    
    testWallKicks() {
        this.log('--- Wall Kick Tests ---');
        
        // Test I-piece wall kicks specifically
        const iPiece = {
            type: 'I',
            shape: this.game.tetrominoes.I.shape,
            color: 1,
            x: 0,
            y: 5,
            rotation: 0
        };
        
        // Place blocks to force wall kick
        this.game.board[5][0] = 1;
        this.game.board[5][1] = 1;
        
        const kickData = this.game.getWallKickData('I', 0, 1);
        let kickSuccess = false;
        
        for (let [kickX, kickY] of kickData) {
            if (!this.game.checkCollision(iPiece, kickX, kickY, 1)) {
                kickSuccess = true;
                break;
            }
        }
        
        this.log('I-piece wall kick system working', kickSuccess);
        
        // Clean up
        this.game.board[5][0] = 0;
        this.game.board[5][1] = 0;
    }
    
    testBoundaryCollisions() {
        this.log('--- Boundary Collision Tests ---');
        
        // Test all edges of the board
        const testPiece = this.game.createRandomPiece();
        
        // Top boundary
        testPiece.y = -1;
        const topBoundary = this.game.checkCollision(testPiece, 0, 0);
        this.log('Top boundary collision', topBoundary);
        
        // Bottom boundary
        testPiece.y = this.game.ROWS;
        const bottomBoundary = this.game.checkCollision(testPiece, 0, 0);
        this.log('Bottom boundary collision', bottomBoundary);
        
        // Left boundary
        testPiece.x = -1;
        testPiece.y = 5;
        const leftBoundary = this.game.checkCollision(testPiece, 0, 0);
        this.log('Left boundary collision', leftBoundary);
        
        // Right boundary
        testPiece.x = this.game.COLS;
        const rightBoundary = this.game.checkCollision(testPiece, 0, 0);
        this.log('Right boundary collision', rightBoundary);
    }
    
    testComplexScenarios() {
        this.log('--- Complex Scenario Tests ---');
        
        // Create a complex board state
        for (let col = 0; col < this.game.COLS - 2; col++) {
            this.game.board[this.game.ROWS - 1][col] = 1;
        }
        
        // Test piece placement in tight space
        const testPiece = {
            type: 'I',
            shape: this.game.tetrominoes.I.shape,
            color: 1,
            x: this.game.COLS - 2,
            y: this.game.ROWS - 4,
            rotation: 1 // Vertical orientation
        };
        
        const tightSpacePlacement = !this.game.checkCollision(testPiece, 0, 0);
        this.log('Piece fits in tight vertical space', tightSpacePlacement);
        
        // Test rotation in tight space
        const tightSpaceRotation = this.game.checkCollision(testPiece, 0, 0, 0);
        this.log('Rotation blocked in tight space', tightSpaceRotation);
        
        // Clean up
        for (let col = 0; col < this.game.COLS - 2; col++) {
            this.game.board[this.game.ROWS - 1][col] = 0;
        }
    }
    
    displayResults() {
        const resultsDiv = document.getElementById('testResults');
        resultsDiv.innerHTML = this.testResults.join('<br>');
    }
}

// SIMULATION SYSTEM
class TetrisSimulator {
    constructor(game) {
        this.game = game;
    }
    
    simulateRotations() {
        const results = [];
        results.push('=== Rotation Simulation ===');
        
        const pieceTypes = Object.keys(this.game.tetrominoes);
        
        for (let pieceType of pieceTypes) {
            results.push(`\n--- ${pieceType} Piece ---`);
            
            // Test rotations at different positions
            const positions = [
                {x: 0, y: 5, desc: 'left wall'},
                {x: this.game.COLS - 4, y: 5, desc: 'right wall'},
                {x: 3, y: 0, desc: 'top'},
                {x: 3, y: this.game.ROWS - 4, desc: 'bottom'},
                {x: 3, y: 8, desc: 'center'}
            ];
            
            for (let pos of positions) {
                const testPiece = {
                    type: pieceType,
                    shape: this.game.tetrominoes[pieceType].shape,
                    color: this.game.tetrominoes[pieceType].color,
                    x: pos.x,
                    y: pos.y,
                    rotation: 0
                };
                
                let rotationSuccesses = 0;
                let kicksUsed = 0;
                
                for (let rotation = 0; rotation < 4; rotation++) {
                    testPiece.rotation = rotation;
                    const nextRotation = (rotation + 1) % 4;
                    
                    if (!this.game.checkCollision(testPiece, 0, 0, nextRotation)) {
                        rotationSuccesses++;
                    } else {
                        // Try wall kicks
                        const kickData = this.game.getWallKickData(pieceType, rotation, nextRotation);
                        for (let [kickX, kickY] of kickData) {
                            if (!this.game.checkCollision(testPiece, kickX, kickY, nextRotation)) {
                                rotationSuccesses++;
                                kicksUsed++;
                                break;
                            }
                        }
                    }
                }
                
                results.push(`  ${pos.desc}: ${rotationSuccesses}/4 rotations OK, ${kicksUsed} kicks used`);
            }
        }
        
        document.getElementById('testResults').innerHTML = results.join('<br>');
    }
}

// Initialize game and test systems
let game, testSuite, simulator;

window.addEventListener('load', () => {
    game = new TetrisGame();
    testSuite = new TetrisTestSuite(game);
    simulator = new TetrisSimulator(game);
});

// Global functions for UI
function runCollisionTests() {
    testSuite.runAllTests();
}

function simulateRotations() {
    simulator.simulateRotations();
}

function clearTestResults() {
    document.getElementById('testResults').innerHTML = '';
}

function restartGame() {
    game.restart();
}