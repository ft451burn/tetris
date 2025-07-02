'use client';

import React, { useState, useCallback } from 'react';
import Block from './Block';
import { 
  Block as BlockType, 
  Position, 
  checkCollisionAtPosition, 
  findLowestValidPosition,
  getSnapPosition,
  alignToGrid 
} from '@/utils/collision';

export default function StackingGame() {
  const [blocks, setBlocks] = useState<BlockType[]>([
    {
      id: 'A',
      x: 50,
      y: 50,
      width: 80,
      height: 80,
      color: '#3b82f6',
      shape: 'square'
    },
    {
      id: 'B',
      x: 200,
      y: 50,
      width: 120,
      height: 60,
      color: '#ef4444',
      shape: 'rectangle'
    },
    {
      id: 'C',
      x: 350,
      y: 50,
      width: 100,
      height: 100,
      color: '#10b981',
      shape: 'L-shape'
    },
    {
      id: 'D',
      x: 500,
      y: 50,
      width: 120,
      height: 80,
      color: '#f59e0b',
      shape: 'T-shape'
    }
  ]);
  
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [tempPosition, setTempPosition] = useState<Position | null>(null);

  const handleDragStart = useCallback((blockId: string) => {
    setDraggedBlockId(blockId);
  }, []);

  const handleDragEnd = useCallback((blockId: string) => {
    setBlocks(prevBlocks => {
      const updatedBlocks = prevBlocks.map(block => {
        if (block.id === blockId && tempPosition) {
          const otherBlocks = prevBlocks.filter(b => b.id !== blockId);
          
          // Check for snapping to nearby blocks
          let finalPosition = tempPosition;
          for (const otherBlock of otherBlocks) {
            const snapPos = getSnapPosition(
              { ...block, x: tempPosition.x, y: tempPosition.y },
              otherBlock
            );
            if (snapPos && !checkCollisionAtPosition(block, snapPos, otherBlocks)) {
              finalPosition = snapPos;
              break;
            }
          }
          
          // Align to grid for precise positioning
          finalPosition = alignToGrid(finalPosition);
          
          // Apply gravity - find lowest valid position
          if (!checkCollisionAtPosition(block, finalPosition, otherBlocks)) {
            finalPosition = findLowestValidPosition(
              { ...block, x: finalPosition.x, y: finalPosition.y },
              otherBlocks,
              600 // container height
            );
          }
          
          return { ...block, x: finalPosition.x, y: finalPosition.y };
        }
        return block;
      });
      
      return updatedBlocks;
    });
    
    setDraggedBlockId(null);
    setTempPosition(null);
  }, [tempPosition]);

  const handleMove = useCallback((blockId: string, position: Position) => {
    setTempPosition(position);
  }, []);

  const getBlockAtPosition = (blockId: string): BlockType | undefined => {
    if (!tempPosition || draggedBlockId !== blockId) {
      return blocks.find(b => b.id === blockId);
    }
    
    const block = blocks.find(b => b.id === blockId);
    return block ? { ...block, x: tempPosition.x, y: tempPosition.y } : undefined;
  };

  const isValidPosition = (blockId: string): boolean => {
    const block = getBlockAtPosition(blockId);
    if (!block || draggedBlockId !== blockId || !tempPosition) return true;
    
    const otherBlocks = blocks.filter(b => b.id !== blockId);
    const testBlock = { ...block, x: tempPosition.x, y: tempPosition.y };
    
    // Check bounds
    if (tempPosition.x < 0 || tempPosition.y < 0 || 
        tempPosition.x + block.width > 800 || 
        tempPosition.y + block.height > 600) {
      return false;
    }
    
    // Check collisions
    return !checkCollisionAtPosition(testBlock, tempPosition, otherBlocks);
  };

  const resetBlocks = () => {
    setBlocks([
      {
        id: 'A',
        x: 50,
        y: 50,
        width: 80,
        height: 80,
        color: '#3b82f6',
        shape: 'square'
      },
      {
        id: 'B',
        x: 200,
        y: 50,
        width: 120,
        height: 60,
        color: '#ef4444',
        shape: 'rectangle'
      },
      {
        id: 'C',
        x: 350,
        y: 50,
        width: 100,
        height: 100,
        color: '#10b981',
        shape: 'L-shape'
      },
      {
        id: 'D',
        x: 500,
        y: 50,
        width: 120,
        height: 80,
        color: '#f59e0b',
        shape: 'T-shape'
      }
    ]);
  };

  return (
    <div className="w-full h-screen bg-gray-100 p-4">
      <div className="mb-4 flex gap-4 items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Interlocking Blocks Stacking
        </h1>
        <button
          onClick={resetBlocks}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Reset Blocks
        </button>
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        <p>• Drag blocks to move them around</p>
        <p>• Blocks will snap to nearby blocks and align to grid</p>
        <p>• Gravity will pull blocks down to the lowest valid position</p>
        <p>• Red border indicates invalid placement (collision detected)</p>
      </div>

      <div
        id="stack-container"
        className="relative w-full max-w-4xl h-96 bg-white border-2 border-gray-300 stack-area"
        style={{ width: '800px', height: '600px' }}
      >
        {blocks.map(block => {
          const displayBlock = getBlockAtPosition(block.id);
          return displayBlock ? (
            <Block
              key={block.id}
              block={displayBlock}
              onMove={handleMove}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              isDragging={draggedBlockId === block.id}
              isValidPosition={isValidPosition(block.id)}
            />
          ) : null;
        })}
      </div>
    </div>
  );
}