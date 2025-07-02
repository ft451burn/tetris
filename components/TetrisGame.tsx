'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  GameState, 
  Tetromino, 
  Position, 
  BOARD_WIDTH, 
  BOARD_HEIGHT, 
  CELL_SIZE, 
  TETROMINOES 
} from '../types/tetris';

const TetrisGame: React.FC = () => {
  // Initialize empty board
  const createEmptyBoard = (): number[][] => {
    return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
  };

  // Create a new random tetromino
  const createRandomTetromino = (): Tetromino => {
    const tetrominoKeys = Object.keys(TETROMINOES);
    const randomKey = tetrominoKeys[Math.floor(Math.random() * tetrominoKeys.length)];
    const tetromino = TETROMINOES[randomKey];
    
    return {
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
      shape: tetromino.shape,
      color: tetromino.color,
      rotation: 0
    };
  };

  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    currentPiece: createRandomTetromino(),
    nextPiece: createRandomTetromino(),
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    paused: false
  });

  // Rotate matrix 90 degrees clockwise
  const rotateMatrix = (matrix: number[][]): number[][] => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = matrix[i][j];
      }
    }
    
    return rotated;
  };

  // Get the actual occupied cells of a tetromino
  const getOccupiedCells = (piece: Tetromino): Position[] => {
    const cells: Position[] = [];
    for (let row = 0; row < piece.shape.length; row++) {
      for (let col = 0; col < piece.shape[row].length; col++) {
        if (piece.shape[row][col] === 1) {
          cells.push({
            x: piece.position.x + col,
            y: piece.position.y + row
          });
        }
      }
    }
    return cells;
  };

  // Improved collision detection
  const isValidPosition = (piece: Tetromino, board: number[][]): boolean => {
    const occupiedCells = getOccupiedCells(piece);
    
    for (const cell of occupiedCells) {
      // Check boundaries
      if (cell.x < 0 || cell.x >= BOARD_WIDTH || cell.y >= BOARD_HEIGHT) {
        return false;
      }
      
      // Check if position is below the top (y < 0 is allowed for spawning)
      if (cell.y >= 0 && board[cell.y][cell.x] !== 0) {
        return false;
      }
    }
    
    return true;
  };

  // Move piece with proper collision detection
  const movePiece = (direction: 'left' | 'right' | 'down'): boolean => {
    if (!gameState.currentPiece || gameState.gameOver || gameState.paused) {
      return false;
    }

    const newPosition = { ...gameState.currentPiece.position };
    
    switch (direction) {
      case 'left':
        newPosition.x -= 1;
        break;
      case 'right':
        newPosition.x += 1;
        break;
      case 'down':
        newPosition.y += 1;
        break;
    }

    const newPiece = {
      ...gameState.currentPiece,
      position: newPosition
    };

    if (isValidPosition(newPiece, gameState.board)) {
      setGameState(prev => ({
        ...prev,
        currentPiece: newPiece
      }));
      return true;
    }

    return false;
  };

  // Rotate piece with wall kick logic
  const rotatePiece = (): void => {
    if (!gameState.currentPiece || gameState.gameOver || gameState.paused) {
      return;
    }

    const rotatedShape = rotateMatrix(gameState.currentPiece.shape);
    let newPiece = {
      ...gameState.currentPiece,
      shape: rotatedShape,
      rotation: (gameState.currentPiece.rotation + 1) % 4
    };

    // Try the rotation at current position first
    if (isValidPosition(newPiece, gameState.board)) {
      setGameState(prev => ({
        ...prev,
        currentPiece: newPiece
      }));
      return;
    }

    // Wall kick attempts - try different positions
    const wallKickOffsets = [
      { x: -1, y: 0 }, // Left
      { x: 1, y: 0 },  // Right
      { x: -2, y: 0 }, // Far left
      { x: 2, y: 0 },  // Far right
      { x: 0, y: -1 }, // Up
      { x: -1, y: -1 }, // Left-up
      { x: 1, y: -1 },  // Right-up
    ];

    for (const offset of wallKickOffsets) {
      const testPiece = {
        ...newPiece,
        position: {
          x: gameState.currentPiece.position.x + offset.x,
          y: gameState.currentPiece.position.y + offset.y
        }
      };

      if (isValidPosition(testPiece, gameState.board)) {
        setGameState(prev => ({
          ...prev,
          currentPiece: testPiece
        }));
        return;
      }
    }
  };

  // Hard drop piece to bottom
  const hardDrop = (): void => {
    if (!gameState.currentPiece || gameState.gameOver || gameState.paused) {
      return;
    }

    let newPiece = { ...gameState.currentPiece };
    let dropDistance = 0;

    // Find the lowest valid position
    while (true) {
      const testPiece = {
        ...newPiece,
        position: { ...newPiece.position, y: newPiece.position.y + 1 }
      };

      if (isValidPosition(testPiece, gameState.board)) {
        newPiece = testPiece;
        dropDistance++;
      } else {
        break;
      }
    }

    setGameState(prev => ({
      ...prev,
      currentPiece: newPiece,
      score: prev.score + dropDistance * 2
    }));

    // Lock the piece immediately after hard drop
    setTimeout(() => lockPiece(), 50);
  };

  // Lock piece in place and check for completed lines
  const lockPiece = (): void => {
    if (!gameState.currentPiece) return;

    const newBoard = gameState.board.map(row => [...row]);
    const occupiedCells = getOccupiedCells(gameState.currentPiece);

    // Place the piece on the board
    occupiedCells.forEach(cell => {
      if (cell.y >= 0) {
        newBoard[cell.y][cell.x] = 1;
      }
    });

    // Check for game over
    if (occupiedCells.some(cell => cell.y < 0)) {
      setGameState(prev => ({
        ...prev,
        gameOver: true
      }));
      return;
    }

    // Check for completed lines
    const completedLines: number[] = [];
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      if (newBoard[row].every(cell => cell !== 0)) {
        completedLines.push(row);
      }
    }

    // Remove completed lines
    completedLines.forEach(lineIndex => {
      newBoard.splice(lineIndex, 1);
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    });

    // Calculate score
    const linePoints = [0, 40, 100, 300, 1200];
    const points = linePoints[completedLines.length] * gameState.level;

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPiece: prev.nextPiece,
      nextPiece: createRandomTetromino(),
      score: prev.score + points,
      lines: prev.lines + completedLines.length,
      level: Math.floor((prev.lines + completedLines.length) / 10) + 1
    }));
  };

  // Game loop - handle automatic piece falling
  useEffect(() => {
    if (gameState.gameOver || gameState.paused) return;

    const dropInterval = Math.max(50, 800 - (gameState.level - 1) * 50);
    
    const gameLoop = setInterval(() => {
      if (!movePiece('down')) {
        lockPiece();
      }
    }, dropInterval);

    return () => clearInterval(gameLoop);
  }, [gameState.level, gameState.gameOver, gameState.paused]);

  // Handle keyboard input
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameState.gameOver) return;

    switch (event.code) {
      case 'ArrowLeft':
        event.preventDefault();
        movePiece('left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        movePiece('right');
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (movePiece('down')) {
          setGameState(prev => ({ ...prev, score: prev.score + 1 }));
        }
        break;
      case 'ArrowUp':
      case 'Space':
        event.preventDefault();
        if (event.code === 'Space') {
          hardDrop();
        } else {
          rotatePiece();
        }
        break;
      case 'KeyP':
        event.preventDefault();
        setGameState(prev => ({ ...prev, paused: !prev.paused }));
        break;
    }
  }, [gameState.gameOver, gameState.paused]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Render the game board
  const renderBoard = (): React.ReactElement[] => {
    const boardWithPiece = gameState.board.map(row => [...row]);
    
    // Draw current piece on the board
    if (gameState.currentPiece) {
      const occupiedCells = getOccupiedCells(gameState.currentPiece);
      occupiedCells.forEach(cell => {
        if (cell.y >= 0 && cell.y < BOARD_HEIGHT && cell.x >= 0 && cell.x < BOARD_WIDTH) {
          boardWithPiece[cell.y][cell.x] = 2; // Different value for current piece
        }
      });
    }

    const cells: React.ReactElement[] = [];
    boardWithPiece.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        cells.push(
          <div
            key={`${rowIndex}-${colIndex}`}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: cell === 1 ? '#666' : cell === 2 ? gameState.currentPiece?.color : '#000',
              border: '1px solid #333',
              transition: 'background-color 0.1s ease'
            }}
          />
        );
      });
    });
    
    return cells;
  };

  // Reset game
  const resetGame = (): void => {
    setGameState({
      board: createEmptyBoard(),
      currentPiece: createRandomTetromino(),
      nextPiece: createRandomTetromino(),
      score: 0,
      level: 1,
      lines: 0,
      gameOver: false,
      paused: false
    });
  };

  return (
    <div 
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#000',
        color: '#fff',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div 
        style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'flex-start'
        }}
      >
        <div style={{ minWidth: '200px' }}>
          <h2 style={{ marginTop: 0 }}>Tetris</h2>
          <div style={{ marginBottom: '8px' }}>Score: {gameState.score}</div>
          <div style={{ marginBottom: '8px' }}>Level: {gameState.level}</div>
          <div style={{ marginBottom: '8px' }}>Lines: {gameState.lines}</div>
          {gameState.paused && (
            <div style={{ fontWeight: 'bold', color: '#ff0000', fontSize: '18px', marginBottom: '8px' }}>
              PAUSED
            </div>
          )}
          {gameState.gameOver && (
            <div style={{ fontWeight: 'bold', color: '#ff0000', fontSize: '18px', marginBottom: '8px' }}>
              GAME OVER
            </div>
          )}
          
          <div style={{ marginTop: '20px', fontSize: '14px' }}>
            <h3 style={{ marginBottom: '10px' }}>Controls:</h3>
            <div style={{ marginBottom: '4px' }}>← → Move left/right</div>
            <div style={{ marginBottom: '4px' }}>↓ Soft drop</div>
            <div style={{ marginBottom: '4px' }}>↑ Rotate</div>
            <div style={{ marginBottom: '4px' }}>Space Hard drop</div>
            <div style={{ marginBottom: '4px' }}>P Pause</div>
          </div>
          
          {gameState.gameOver && (
            <button 
              onClick={resetGame}
              style={{
                backgroundColor: '#333',
                color: '#fff',
                border: '1px solid #666',
                padding: '10px 20px',
                marginTop: '10px',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#555'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#333'}
            >
              New Game
            </button>
          )}
        </div>
        
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL_SIZE}px)`,
            gap: '1px',
            border: '2px solid #333',
            backgroundColor: '#111',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)'
          }}
        >
          {renderBoard()}
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;