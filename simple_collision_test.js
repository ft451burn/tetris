// Simple Collision Detection Test
// Tests the core collision detection logic without browser dependencies

// Tetris game board configuration
const COLS = 10;
const ROWS = 20;

// Create empty board
function createBoard() {
    return Array(ROWS).fill().map(() => Array(COLS).fill(0));
}

// Tetromino definitions (simplified)
const tetrominoes = {
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
    }
};

// Core collision detection function
function checkCollision(board, piece, deltaX, deltaY, newRotation) {
    const newX = piece.x + deltaX;
    const newY = piece.y + deltaY;
    const shape = piece.shape[newRotation !== undefined ? newRotation : piece.rotation];
    
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const boardX = newX + col;
                const boardY = newY + row;
                
                // Check boundaries
                if (boardX < 0 || boardX >= COLS || 
                    boardY < 0 || boardY >= ROWS) {
                    return true;
                }
                
                // Check board collision
                if (board[boardY] && board[boardY][boardX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Test runner
class SimpleCollisionTester {
    constructor() {
        this.tests = 0;
        this.passed = 0;
    }
    
    test(name, testFn) {
        this.tests++;
        try {
            if (testFn()) {
                console.log(`✓ ${name}`);
                this.passed++;
            } else {
                console.log(`✗ ${name}`);
            }
        } catch (error) {
            console.log(`✗ ${name} - Error: ${error.message}`);
        }
    }
    
    runTests() {
        console.log('🧪 Running Simple Collision Detection Tests\n');
        
        // Test 1: Left boundary collision
        this.test('Left boundary collision', () => {
            const board = createBoard();
            const piece = {
                type: 'T',
                shape: tetrominoes.T.shape,
                x: -1,
                y: 5,
                rotation: 0
            };
            return checkCollision(board, piece, 0, 0);
        });
        
        // Test 2: Right boundary collision
        this.test('Right boundary collision', () => {
            const board = createBoard();
            const piece = {
                type: 'T',
                shape: tetrominoes.T.shape,
                x: COLS,
                y: 5,
                rotation: 0
            };
            return checkCollision(board, piece, 0, 0);
        });
        
        // Test 3: Bottom boundary collision
        this.test('Bottom boundary collision', () => {
            const board = createBoard();
            const piece = {
                type: 'T',
                shape: tetrominoes.T.shape,
                x: 5,
                y: ROWS,
                rotation: 0
            };
            return checkCollision(board, piece, 0, 0);
        });
        
        // Test 4: No collision in open space
        this.test('No collision in open space', () => {
            const board = createBoard();
            const piece = {
                type: 'T',
                shape: tetrominoes.T.shape,
                x: 5,
                y: 5,
                rotation: 0
            };
            return !checkCollision(board, piece, 0, 0);
        });
        
        // Test 5: Piece-to-piece collision
        this.test('Piece-to-piece collision', () => {
            const board = createBoard();
            board[11][5] = 1; // Place obstacle at row 11, col 5
            
            const piece = {
                type: 'T',
                shape: tetrominoes.T.shape,
                x: 4,   // T piece starting at (4,9)
                y: 9,   
                rotation: 0  // T shape: row 0: [0,1,0,0], row 1: [1,1,1,0]
            };
            
            // T-piece shape at rotation 0:
            // Row 0: [0,1,0,0] at board position y=9  -> block at (5,9)
            // Row 1: [1,1,1,0] at board position y=10 -> blocks at (4,10), (5,10), (6,10)
            // 
            // Moving down by 2 positions (deltaY=2):
            // Row 0: [0,1,0,0] at board position y=11 -> block at (5,11)  
            // Row 1: [1,1,1,0] at board position y=12 -> blocks at (4,12), (5,12), (6,12)
            //
            // We placed obstacle at (5,11), so there should be collision
            return checkCollision(board, piece, 0, 2);
        });
        
        // Test 6: I-piece rotation at edge
        this.test('I-piece rotation collision at edge', () => {
            const board = createBoard();
            const piece = {
                type: 'I',
                shape: tetrominoes.I.shape,
                x: 8, // Near right edge
                y: 5,
                rotation: 0 // Horizontal
            };
            // Rotating to vertical should cause collision
            return checkCollision(board, piece, 0, 0, 1);
        });
        
        // Test 7: Valid I-piece vertical placement
        this.test('Valid I-piece vertical placement', () => {
            const board = createBoard();
            const piece = {
                type: 'I',
                shape: tetrominoes.I.shape,
                x: 5,
                y: 5,
                rotation: 1 // Vertical
            };
            return !checkCollision(board, piece, 0, 0);
        });
        
        // Test 8: O-piece collision (square piece)
        this.test('O-piece boundary detection', () => {
            const board = createBoard();
            const piece = {
                type: 'O',
                shape: tetrominoes.O.shape,
                x: COLS - 1, // Too far right for 2x2 piece
                y: 5,
                rotation: 0
            };
            return checkCollision(board, piece, 0, 0);
        });
        
        // Test 9: Complex collision pattern
        this.test('Complex collision pattern', () => {
            const board = createBoard();
            
            // Create a complex pattern
            board[18][3] = 1;
            board[19][3] = 1;
            board[19][4] = 1;
            board[19][5] = 1;
            
            const piece = {
                type: 'T',
                shape: tetrominoes.T.shape,
                x: 3,
                y: 17,
                rotation: 0
            };
            
            return checkCollision(board, piece, 0, 1);
        });
        
        // Test 10: Near-miss collision (should NOT collide)
        this.test('Near-miss collision test', () => {
            const board = createBoard();
            board[10][3] = 1; // Place block
            
            const piece = {
                type: 'T',
                shape: tetrominoes.T.shape,
                x: 5, // Far enough away
                y: 5,
                rotation: 0
            };
            
            return !checkCollision(board, piece, 0, 0);
        });
        
        // Report results
        console.log(`\n📊 Test Results: ${this.passed}/${this.tests} passed`);
        console.log(`Success Rate: ${((this.passed / this.tests) * 100).toFixed(1)}%`);
        
        if (this.passed === this.tests) {
            console.log('🎉 All collision detection tests passed!');
            console.log('✅ Collision system is working correctly.');
        } else {
            console.log('⚠️ Some tests failed. Collision detection needs review.');
        }
        
        return this.passed === this.tests;
    }
}

// Run tests
const tester = new SimpleCollisionTester();
const allPassed = tester.runTests();

// Advanced collision scenarios test
console.log('\n🔬 Running Advanced Collision Scenarios\n');

function testRotationCollisions() {
    let rotationTests = 0;
    let rotationPassed = 0;
    
    Object.keys(tetrominoes).forEach(pieceType => {
        for (let rotation = 0; rotation < 4; rotation++) {
            rotationTests++;
            
            const board = createBoard();
            const piece = {
                type: pieceType,
                shape: tetrominoes[pieceType].shape,
                x: 1,
                y: 5,
                rotation: rotation
            };
            
            // Test if piece fits in this rotation
            if (!checkCollision(board, piece, 0, 0)) {
                rotationPassed++;
                console.log(`✓ ${pieceType} rotation ${rotation} valid`);
            } else {
                console.log(`✗ ${pieceType} rotation ${rotation} invalid at position (1,5)`);
            }
        }
    });
    
    console.log(`\n🔄 Rotation Tests: ${rotationPassed}/${rotationTests} passed`);
    return rotationPassed === rotationTests;
}

const rotationsPassed = testRotationCollisions();

// Final summary
console.log('\n=== FINAL COLLISION SYSTEM VALIDATION ===');
console.log(`Basic Collision Tests: ${allPassed ? 'PASSED' : 'FAILED'}`);
console.log(`Rotation Tests: ${rotationsPassed ? 'PASSED' : 'FAILED'}`);

if (allPassed && rotationsPassed) {
    console.log('\n🏆 COLLISION SYSTEM VALIDATION SUCCESSFUL!');
    console.log('The collision detection is robust and handles all tested scenarios correctly.');
} else {
    console.log('\n❌ COLLISION SYSTEM NEEDS ATTENTION');
    console.log('Some collision scenarios are not handled correctly.');
}

module.exports = { checkCollision, tetrominoes, createBoard };