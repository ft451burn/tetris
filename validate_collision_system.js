// Collision Detection Validation Script
// This script validates the core collision detection logic without needing a browser

// Mock DOM elements for testing
const mockCanvas = {
    getContext: () => ({
        fillStyle: '',
        fillRect: () => {},
        strokeStyle: '',
        strokeRect: () => {},
        lineWidth: 0
    })
};

// Mock document for Node.js environment
global.document = {
    getElementById: (id) => {
        if (id === 'gameCanvas' || id === 'nextCanvas') {
            return mockCanvas;
        }
        return { textContent: '', innerHTML: '', style: { display: '' } };
    },
    addEventListener: () => {}
};

global.window = {
    addEventListener: () => {},
    requestAnimationFrame: (callback) => setTimeout(callback, 16)
};

// Mock Date.now for consistent testing
const originalDateNow = Date.now;
let mockTime = 0;
Date.now = () => mockTime;

// Import the TetrisGame class (we'll eval the file content)
const fs = require('fs');
const tetrisCode = fs.readFileSync('tetris.js', 'utf8');

// Remove problematic browser-specific code for Node.js
const modifiedTetrisCode = tetrisCode
    .replace(/window\.addEventListener.*?;/g, '')
    .replace(/document\.getElementById.*?textContent.*?;/g, '')
    .replace(/document\.getElementById.*?innerHTML.*?;/g, '')
    .replace(/document\.getElementById.*?style\.display.*?;/g, '')
    .replace(/requestAnimationFrame.*?gameLoop.*?\)/g, '// requestAnimationFrame removed');

eval(modifiedTetrisCode);

// Validation Tests
class CollisionValidation {
    constructor() {
        this.game = new TetrisGame();
        this.testCount = 0;
        this.passedTests = 0;
    }
    
    test(description, testFunction) {
        this.testCount++;
        try {
            const result = testFunction();
            if (result) {
                console.log(`✓ ${description}`);
                this.passedTests++;
                return true;
            } else {
                console.log(`✗ ${description}`);
                return false;
            }
        } catch (error) {
            console.log(`✗ ${description} - Error: ${error.message}`);
            return false;
        }
    }
    
    validateCollisionDetection() {
        console.log('🔍 Validating Collision Detection System\n');
        
        // Test 1: Basic boundary collisions
        this.test('Left boundary collision detection', () => {
            const piece = this.game.createRandomPiece();
            piece.x = -1;
            piece.y = 5;
            return this.game.checkCollision(piece, 0, 0);
        });
        
        this.test('Right boundary collision detection', () => {
            const piece = this.game.createRandomPiece();
            piece.x = this.game.COLS;
            piece.y = 5;
            return this.game.checkCollision(piece, 0, 0);
        });
        
        this.test('Bottom boundary collision detection', () => {
            const piece = this.game.createRandomPiece();
            piece.x = 5;
            piece.y = this.game.ROWS;
            return this.game.checkCollision(piece, 0, 0);
        });
        
        // Test 2: Piece-to-piece collisions
        this.test('Piece-to-piece collision detection', () => {
            this.game.board[10][5] = 1; // Place obstacle
            const piece = this.game.createRandomPiece();
            piece.x = 4;
            piece.y = 9;
            const collision = this.game.checkCollision(piece, 1, 1);
            this.game.board[10][5] = 0; // Clean up
            return collision;
        });
        
        // Test 3: Rotation collision detection
        this.test('Rotation collision detection', () => {
            // Test I-piece rotation at edge
            const iPiece = {
                type: 'I',
                shape: this.game.tetrominoes.I.shape,
                color: 1,
                x: 7,
                y: 5,
                rotation: 0
            };
            return this.game.checkCollision(iPiece, 0, 0, 1); // Should collide with right edge
        });
        
        // Test 4: Valid placement detection
        this.test('Valid placement detection', () => {
            const piece = this.game.createRandomPiece();
            piece.x = 3;
            piece.y = 5;
            return !this.game.checkCollision(piece, 0, 0); // Should NOT collide
        });
        
        // Test 5: Wall kick data integrity
        this.test('Wall kick data exists for all pieces', () => {
            const iPieceKicks = this.game.wallKickData.I;
            const standardKicks = this.game.wallKickData.JLSTZ;
            
            const requiredTransitions = ['0->1', '1->0', '1->2', '2->1', '2->3', '3->2', '3->0', '0->3'];
            
            const iKicksExist = requiredTransitions.every(t => iPieceKicks[t]);
            const standardKicksExist = requiredTransitions.every(t => standardKicks[t]);
            
            return iKicksExist && standardKicksExist;
        });
        
        // Test 6: Tetromino shape integrity
        this.test('All tetromino shapes are properly defined', () => {
            const pieces = Object.keys(this.game.tetrominoes);
            
            for (let pieceType of pieces) {
                const piece = this.game.tetrominoes[pieceType];
                
                // Check 4 rotation states
                if (piece.shape.length !== 4) return false;
                
                // Check 4x4 matrix for each rotation
                for (let rotation = 0; rotation < 4; rotation++) {
                    if (piece.shape[rotation].length !== 4) return false;
                    for (let row = 0; row < 4; row++) {
                        if (piece.shape[rotation][row].length !== 4) return false;
                    }
                }
                
                // Check color is defined
                if (!piece.color) return false;
            }
            
            return true;
        });
        
        // Test 7: Complex collision scenario
        this.test('Complex collision scenario handling', () => {
            // Create complex board state
            for (let col = 0; col < this.game.COLS - 3; col++) {
                this.game.board[this.game.ROWS - 1][col] = 1;
            }
            
            // Test piece placement in remaining space
            const testPiece = {
                type: 'I',
                shape: this.game.tetrominoes.I.shape,
                color: 1,
                x: this.game.COLS - 1,
                y: this.game.ROWS - 4,
                rotation: 1 // Vertical
            };
            
            const canPlace = !this.game.checkCollision(testPiece, 0, 0);
            
            // Clean up
            for (let col = 0; col < this.game.COLS - 3; col++) {
                this.game.board[this.game.ROWS - 1][col] = 0;
            }
            
            return canPlace; // Should be able to place vertically
        });
        
        // Test 8: Rotation with wall kicks
        this.test('Wall kick rotation system', () => {
            const testPiece = {
                type: 'T',
                shape: this.game.tetrominoes.T.shape,
                color: 3,
                x: 0,
                y: 5,
                rotation: 0
            };
            
            // Get kick data
            const kickData = this.game.getWallKickData('T', 0, 1);
            
            // At least one kick should work for T-piece at left edge
            let kickWorked = false;
            for (let [kickX, kickY] of kickData) {
                if (!this.game.checkCollision(testPiece, kickX, kickY, 1)) {
                    kickWorked = true;
                    break;
                }
            }
            
            return kickWorked;
        });
    }
    
    validateGameLogic() {
        console.log('\n🎮 Validating Game Logic\n');
        
        // Test piece spawning
        this.test('Piece spawning works correctly', () => {
            const originalPiece = this.game.currentPiece;
            this.game.spawnPiece();
            const newPiece = this.game.currentPiece;
            
            return newPiece && 
                   newPiece.type && 
                   newPiece.shape && 
                   typeof newPiece.x === 'number' && 
                   typeof newPiece.y === 'number';
        });
        
        // Test movement validation
        this.test('Movement validation works', () => {
            const piece = this.game.currentPiece;
            const originalX = piece.x;
            
            // Valid move should succeed
            const validMove = this.game.movePiece(1, 0);
            
            // Invalid move should fail
            piece.x = this.game.COLS - 1;
            const invalidMove = !this.game.movePiece(10, 0);
            
            // Restore position
            piece.x = originalX;
            
            return validMove && invalidMove;
        });
        
        // Test line clearing logic
        this.test('Line clearing detection', () => {
            // Fill a complete line
            for (let col = 0; col < this.game.COLS; col++) {
                this.game.board[this.game.ROWS - 1][col] = 1;
            }
            
            const linesBefore = this.game.lines;
            this.game.clearLines();
            const linesAfter = this.game.lines;
            
            return linesAfter > linesBefore;
        });
    }
    
    runAllValidations() {
        console.log('🚀 Starting Comprehensive Collision System Validation\n');
        
        this.validateCollisionDetection();
        this.validateGameLogic();
        
        console.log(`\n📊 Validation Results:`);
        console.log(`   Passed: ${this.passedTests}/${this.testCount}`);
        console.log(`   Success Rate: ${((this.passedTests / this.testCount) * 100).toFixed(1)}%`);
        
        if (this.passedTests === this.testCount) {
            console.log('🎉 All validations passed! Collision system is robust.');
        } else {
            console.log('⚠️ Some validations failed. Review the collision system.');
        }
        
        return {
            passed: this.passedTests,
            total: this.testCount,
            successRate: (this.passedTests / this.testCount) * 100
        };
    }
}

// Run validations if this script is executed directly
if (require.main === module) {
    const validator = new CollisionValidation();
    validator.runAllValidations();
}

module.exports = CollisionValidation;