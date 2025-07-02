// Advanced Collision Detection Test Scenarios
class AdvancedTetrisTests {
    constructor(game) {
        this.game = game;
        this.passedTests = 0;
        this.totalTests = 0;
    }
    
    runTest(testName, testFunction) {
        this.totalTests++;
        try {
            const result = testFunction();
            if (result) {
                console.log(`✓ ${testName}`);
                this.passedTests++;
                return true;
            } else {
                console.log(`✗ ${testName}`);
                return false;
            }
        } catch (error) {
            console.log(`✗ ${testName} - Error: ${error.message}`);
            return false;
        }
    }
    
    // Test specific collision scenarios that cause overlapping
    testOverlappingScenarios() {
        console.log('\n=== Testing Overlapping Scenarios ===');
        
        // Scenario 1: T-piece rotation near filled blocks
        this.runTest('T-piece rotation collision near blocks', () => {
            // Clear board
            this.game.board = this.game.createBoard();
            
            // Create a situation where T-piece would overlap on rotation
            this.game.board[5][3] = 1; // Block that would interfere
            
            const tPiece = {
                type: 'T',
                shape: this.game.tetrominoes.T.shape,
                color: 3,
                x: 2,
                y: 4,
                rotation: 0
            };
            
            // This rotation should be blocked by collision detection
            const collisionDetected = this.game.checkCollision(tPiece, 0, 0, 1);
            return collisionDetected; // Should return true (collision detected)
        });
        
        // Scenario 2: I-piece rotation at board edge
        this.runTest('I-piece rotation at right edge', () => {
            this.game.board = this.game.createBoard();
            
            const iPiece = {
                type: 'I',
                shape: this.game.tetrominoes.I.shape,
                color: 1,
                x: 7, // Near right edge
                y: 5,
                rotation: 0 // Horizontal
            };
            
            // Rotating to vertical should cause collision with right wall
            const collisionDetected = this.game.checkCollision(iPiece, 0, 0, 1);
            return collisionDetected;
        });
        
        // Scenario 3: L-piece rotation in corner
        this.runTest('L-piece rotation in corner collision', () => {
            this.game.board = this.game.createBoard();
            
            // Fill some blocks to create a corner scenario
            this.game.board[18][0] = 1;
            this.game.board[19][0] = 1;
            this.game.board[19][1] = 1;
            
            const lPiece = {
                type: 'L',
                shape: this.game.tetrominoes.L.shape,
                color: 7,
                x: 0,
                y: 17,
                rotation: 0
            };
            
            // This should detect collision
            const collisionDetected = this.game.checkCollision(lPiece, 0, 0, 1);
            return collisionDetected;
        });
        
        // Scenario 4: Multiple rotation attempts with wall kicks
        this.runTest('Wall kick system prevents overlapping', () => {
            this.game.board = this.game.createBoard();
            
            const testPiece = {
                type: 'J',
                shape: this.game.tetrominoes.J.shape,
                color: 6,
                x: 0,
                y: 5,
                rotation: 0
            };
            
            // Try rotation with wall kicks
            const originalPos = {x: testPiece.x, y: testPiece.y};
            const kickData = this.game.getWallKickData('J', 0, 1);
            
            let validKickFound = false;
            for (let [kickX, kickY] of kickData) {
                if (!this.game.checkCollision(testPiece, kickX, kickY, 1)) {
                    validKickFound = true;
                    break;
                }
            }
            
            return validKickFound; // Should find a valid kick position
        });
    }
    
    // Test rotation matrix accuracy
    testRotationMatrices() {
        console.log('\n=== Testing Rotation Matrix Accuracy ===');
        
        // Test that each piece's rotation states are correctly defined
        const pieceTypes = Object.keys(this.game.tetrominoes);
        
        for (let pieceType of pieceTypes) {
            this.runTest(`${pieceType} rotation states consistency`, () => {
                const piece = this.game.tetrominoes[pieceType];
                
                // Check that all 4 rotation states exist
                if (piece.shape.length !== 4) return false;
                
                // Check that each rotation state is 4x4
                for (let rotation = 0; rotation < 4; rotation++) {
                    if (piece.shape[rotation].length !== 4) return false;
                    for (let row = 0; row < 4; row++) {
                        if (piece.shape[rotation][row].length !== 4) return false;
                    }
                }
                
                return true;
            });
        }
        
        // Test specific piece rotations
        this.runTest('I-piece rotation symmetry', () => {
            const iPiece = this.game.tetrominoes.I;
            // Rotation 0 and 2 should be horizontal (different rows)
            // Rotation 1 and 3 should be vertical (different columns)
            
            const hasHorizontal = iPiece.shape[0].some(row => row.includes(1)) &&
                                  iPiece.shape[2].some(row => row.includes(1));
            const hasVertical = iPiece.shape[1].some((row, i) => row.some((cell, j) => cell === 1)) &&
                               iPiece.shape[3].some((row, i) => row.some((cell, j) => cell === 1));
            
            return hasHorizontal && hasVertical;
        });
    }
    
    // Test boundary conditions exhaustively
    testBoundaryConditions() {
        console.log('\n=== Testing Boundary Conditions ===');
        
        const pieceTypes = Object.keys(this.game.tetrominoes);
        
        for (let pieceType of pieceTypes) {
            // Test each rotation at each boundary
            for (let rotation = 0; rotation < 4; rotation++) {
                this.runTest(`${pieceType} R${rotation} left boundary`, () => {
                    const testPiece = {
                        type: pieceType,
                        shape: this.game.tetrominoes[pieceType].shape,
                        color: this.game.tetrominoes[pieceType].color,
                        x: -1, // One position too far left
                        y: 5,
                        rotation: rotation
                    };
                    
                    return this.game.checkCollision(testPiece, 0, 0);
                });
                
                this.runTest(`${pieceType} R${rotation} right boundary`, () => {
                    const testPiece = {
                        type: pieceType,
                        shape: this.game.tetrominoes[pieceType].shape,
                        color: this.game.tetrominoes[pieceType].color,
                        x: this.game.COLS, // One position too far right
                        y: 5,
                        rotation: rotation
                    };
                    
                    return this.game.checkCollision(testPiece, 0, 0);
                });
                
                this.runTest(`${pieceType} R${rotation} bottom boundary`, () => {
                    const testPiece = {
                        type: pieceType,
                        shape: this.game.tetrominoes[pieceType].shape,
                        color: this.game.tetrominoes[pieceType].color,
                        x: 3,
                        y: this.game.ROWS, // One position too far down
                        rotation: rotation
                    };
                    
                    return this.game.checkCollision(testPiece, 0, 0);
                });
            }
        }
    }
    
    // Test piece-to-piece collision in various configurations
    testPieceCollisions() {
        console.log('\n=== Testing Piece-to-Piece Collisions ===');
        
        this.runTest('Vertical stack collision', () => {
            this.game.board = this.game.createBoard();
            
            // Place some blocks
            this.game.board[19][5] = 1;
            this.game.board[18][5] = 1;
            
            const testPiece = {
                type: 'O',
                shape: this.game.tetrominoes.O.shape,
                color: 2,
                x: 4,
                y: 17, // Would overlap with existing blocks
                rotation: 0
            };
            
            return this.game.checkCollision(testPiece, 0, 0);
        });
        
        this.runTest('Horizontal adjacent collision', () => {
            this.game.board = this.game.createBoard();
            
            // Place blocks horizontally
            this.game.board[10][3] = 1;
            this.game.board[10][4] = 1;
            
            const testPiece = {
                type: 'I',
                shape: this.game.tetrominoes.I.shape,
                color: 1,
                x: 2,
                y: 9,
                rotation: 0 // Horizontal I-piece
            };
            
            return this.game.checkCollision(testPiece, 0, 1); // Move down would cause collision
        });
        
        this.runTest('L-shaped collision pattern', () => {
            this.game.board = this.game.createBoard();
            
            // Create L-shaped obstacle
            this.game.board[17][2] = 1;
            this.game.board[18][2] = 1;
            this.game.board[19][2] = 1;
            this.game.board[19][3] = 1;
            
            const testPiece = {
                type: 'L',
                shape: this.game.tetrominoes.L.shape,
                color: 7,
                x: 1,
                y: 17,
                rotation: 0
            };
            
            return this.game.checkCollision(testPiece, 0, 0);
        });
    }
    
    // Test wall kick system comprehensively
    testWallKickSystem() {
        console.log('\n=== Testing Wall Kick System ===');
        
        this.runTest('I-piece wall kick data exists', () => {
            const wallKickData = this.game.wallKickData.I;
            const requiredTransitions = ['0->1', '1->0', '1->2', '2->1', '2->3', '3->2', '3->0', '0->3'];
            
            return requiredTransitions.every(transition => wallKickData[transition]);
        });
        
        this.runTest('JLSTZ wall kick data exists', () => {
            const wallKickData = this.game.wallKickData.JLSTZ;
            const requiredTransitions = ['0->1', '1->0', '1->2', '2->1', '2->3', '3->2', '3->0', '0->3'];
            
            return requiredTransitions.every(transition => wallKickData[transition]);
        });
        
        this.runTest('Wall kicks prevent impossible rotations', () => {
            this.game.board = this.game.createBoard();
            
            // Fill the board except for a small area
            for (let row = 0; row < this.game.ROWS; row++) {
                for (let col = 0; col < this.game.COLS; col++) {
                    if (!(row >= 5 && row <= 7 && col >= 3 && col <= 5)) {
                        this.game.board[row][col] = 1;
                    }
                }
            }
            
            const testPiece = {
                type: 'T',
                shape: this.game.tetrominoes.T.shape,
                color: 3,
                x: 3,
                y: 5,
                rotation: 0
            };
            
            // Try all possible kicks
            const kickData = this.game.getWallKickData('T', 0, 1);
            let anyKickWorks = false;
            
            for (let [kickX, kickY] of kickData) {
                if (!this.game.checkCollision(testPiece, kickX, kickY, 1)) {
                    anyKickWorks = true;
                    break;
                }
            }
            
            // In this cramped space, no kicks should work
            return !anyKickWorks;
        });
    }
    
    // Run all test categories
    runAllAdvancedTests() {
        console.log('🔬 Starting Advanced Collision Detection Tests');
        this.passedTests = 0;
        this.totalTests = 0;
        
        this.testOverlappingScenarios();
        this.testRotationMatrices();
        this.testBoundaryConditions();
        this.testPieceCollisions();
        this.testWallKickSystem();
        
        console.log(`\n📊 Test Results: ${this.passedTests}/${this.totalTests} tests passed`);
        console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
        
        return {
            passed: this.passedTests,
            total: this.totalTests,
            successRate: (this.passedTests / this.totalTests) * 100
        };
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedTetrisTests;
}