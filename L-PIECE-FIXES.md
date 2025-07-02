# L-Piece Movement and Collision Detection Fixes

## Issues Addressed

The original problems reported were:
1. **L piece moves down too far/too much** ("nadal nachodzi klocek L na dół za mocno")
2. **Cannot move L piece to left wall** ("nie mozna go dosunac do lewej sciany")
3. **Cannot move to right wall either** ("do prawej chyba tez")
4. **In one rotation position, piece cannot be moved** ("w jednej z pozycji obrotu nie da sie dosunac")

## Fixes Implemented

### 1. Improved Collision Detection (`isValidPosition` function)

```typescript
const isValidPosition = (piece: Tetromino, board: number[][]): boolean => {
  const occupiedCells = getOccupiedCells(piece);
  
  for (const cell of occupiedCells) {
    // Check boundaries - prevents moving through walls
    if (cell.x < 0 || cell.x >= BOARD_WIDTH || cell.y >= BOARD_HEIGHT) {
      return false;
    }
    
    // Check if position collides with existing blocks
    if (cell.y >= 0 && board[cell.y][cell.x] !== 0) {
      return false;
    }
  }
  
  return true;
};
```

**Key improvements:**
- Precise boundary checking for all four walls
- Proper collision detection with existing blocks
- Handles spawning pieces above the visible board area

### 2. Enhanced Movement Logic (`movePiece` function)

```typescript
const movePiece = (direction: 'left' | 'right' | 'down'): boolean => {
  // Creates new position and validates before applying
  const newPosition = { ...gameState.currentPiece.position };
  
  switch (direction) {
    case 'left': newPosition.x -= 1; break;
    case 'right': newPosition.x += 1; break;
    case 'down': newPosition.y += 1; break;
  }

  const newPiece = { ...gameState.currentPiece, position: newPosition };

  if (isValidPosition(newPiece, gameState.board)) {
    // Only apply movement if valid
    setGameState(prev => ({ ...prev, currentPiece: newPiece }));
    return true;
  }

  return false; // Movement blocked
};
```

**Key improvements:**
- Validates movement before applying changes
- Returns boolean to indicate if movement was successful
- Prevents pieces from moving through boundaries or other blocks

### 3. Wall Kick System for Rotation (`rotatePiece` function)

```typescript
const wallKickOffsets = [
  { x: -1, y: 0 }, // Left
  { x: 1, y: 0 },  // Right
  { x: -2, y: 0 }, // Far left
  { x: 2, y: 0 },  // Far right
  { x: 0, y: -1 }, // Up
  { x: -1, y: -1 }, // Left-up
  { x: 1, y: -1 },  // Right-up
];
```

**Key improvements:**
- Tries rotation at current position first
- If blocked, attempts multiple offset positions
- Prevents pieces from getting stuck during rotation
- Handles rotation near walls and other pieces

### 4. Accurate Shape Representation

The L-piece is defined with proper shape matrix:
```typescript
L: {
  shape: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
  ],
  color: '#ffa500'
}
```

### 5. Precise Cell Calculation (`getOccupiedCells` function)

```typescript
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
```

**Key improvements:**
- Calculates exact occupied cells for collision detection
- Works with all rotations and positions
- Enables precise boundary and collision checking

## Game Controls

- **← →** Move left/right (now properly respects walls)
- **↓** Soft drop (controlled descent)
- **↑** Rotate (with wall kick support)
- **Space** Hard drop (instant drop to bottom)
- **P** Pause game

## Testing the Fixes

1. **Left/Right Wall Movement**: Try moving L pieces all the way to both walls - they should stop exactly at the boundary
2. **Rotation Near Walls**: Rotate L pieces near walls - the wall kick system should find valid positions
3. **Collision with Other Pieces**: L pieces should properly stop when hitting other blocks
4. **Controlled Descent**: Pieces should move down one cell at a time, not skipping cells

The collision detection system now ensures that L pieces (and all other pieces) behave consistently and predictably in all rotation states and positions.