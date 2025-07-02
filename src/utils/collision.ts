export interface Block {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  shape: 'rectangle' | 'square' | 'L-shape' | 'T-shape';
}

export interface Position {
  x: number;
  y: number;
}

// Check if two rectangles overlap
export function checkCollision(block1: Block, block2: Block): boolean {
  return (
    block1.x < block2.x + block2.width &&
    block1.x + block1.width > block2.x &&
    block1.y < block2.y + block2.height &&
    block1.y + block1.height > block2.y
  );
}

// Check if a block would collide with any existing blocks at a given position
export function checkCollisionAtPosition(
  movingBlock: Block,
  position: Position,
  existingBlocks: Block[]
): boolean {
  const testBlock = {
    ...movingBlock,
    x: position.x,
    y: position.y
  };

  return existingBlocks.some(block => {
    if (block.id === movingBlock.id) return false;
    return checkCollision(testBlock, block);
  });
}

// Find the lowest valid position for a block (with gravity simulation)
export function findLowestValidPosition(
  block: Block,
  existingBlocks: Block[],
  containerHeight: number
): Position {
  let testY = block.y;
  const stepSize = 5;
  
  // Move down until collision or bottom
  while (testY + block.height < containerHeight) {
    const testPosition = { x: block.x, y: testY + stepSize };
    if (checkCollisionAtPosition(block, testPosition, existingBlocks)) {
      break;
    }
    testY += stepSize;
  }
  
  return { x: block.x, y: testY };
}

// Check if a block can interlock with another (for puzzle-like behavior)
export function canInterlock(block1: Block, block2: Block): boolean {
  const tolerance = 5; // pixels
  
  // Check if blocks are adjacent and can snap together
  const horizontallyAdjacent = 
    Math.abs((block1.x + block1.width) - block2.x) < tolerance ||
    Math.abs((block2.x + block2.width) - block1.x) < tolerance;
    
  const verticallyAdjacent = 
    Math.abs((block1.y + block1.height) - block2.y) < tolerance ||
    Math.abs((block2.y + block2.height) - block1.y) < tolerance;
    
  const horizontalOverlap = 
    Math.max(0, Math.min(block1.x + block1.width, block2.x + block2.width) - Math.max(block1.x, block2.x));
    
  const verticalOverlap = 
    Math.max(0, Math.min(block1.y + block1.height, block2.y + block2.height) - Math.max(block1.y, block2.y));
  
  return (horizontallyAdjacent && verticalOverlap > 0) || 
         (verticallyAdjacent && horizontalOverlap > 0);
}

// Snap block to nearby interlocking positions
export function getSnapPosition(
  movingBlock: Block,
  targetBlock: Block
): Position | null {
  const snapTolerance = 20;
  const positions: Position[] = [
    // Right side
    { x: targetBlock.x + targetBlock.width, y: targetBlock.y },
    // Left side  
    { x: targetBlock.x - movingBlock.width, y: targetBlock.y },
    // Below
    { x: targetBlock.x, y: targetBlock.y + targetBlock.height },
    // Above
    { x: targetBlock.x, y: targetBlock.y - movingBlock.height }
  ];
  
  const currentPos = { x: movingBlock.x, y: movingBlock.y };
  
  for (const pos of positions) {
    const distance = Math.sqrt(
      Math.pow(currentPos.x - pos.x, 2) + Math.pow(currentPos.y - pos.y, 2)
    );
    
    if (distance < snapTolerance) {
      return pos;
    }
  }
  
  return null;
}

// Grid alignment for precise positioning
export function alignToGrid(position: Position, gridSize: number = 20): Position {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  };
}