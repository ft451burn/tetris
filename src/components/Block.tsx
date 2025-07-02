'use client';

import React, { useState, useRef } from 'react';
import { Block as BlockType, Position } from '@/utils/collision';

interface BlockProps {
  block: BlockType;
  onMove: (id: string, position: Position) => void;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string) => void;
  isDragging: boolean;
  isValidPosition: boolean;
}

export default function Block({ 
  block, 
  onMove, 
  onDragStart, 
  onDragEnd, 
  isDragging,
  isValidPosition 
}: BlockProps) {
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const blockRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = blockRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      onDragStart(block.id);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const container = document.getElementById('stack-container');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        onMove(block.id, {
          x: e.clientX - containerRect.left - dragStart.x,
          y: e.clientY - containerRect.top - dragStart.y
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      onDragEnd(block.id);
    }
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const getShapeStyles = () => {
    switch (block.shape) {
      case 'L-shape':
        return 'clip-path: polygon(0 0, 60% 0, 60% 60%, 100% 60%, 100% 100%, 0 100%)';
      case 'T-shape':
        return 'clip-path: polygon(20% 0, 80% 0, 80% 40%, 100% 40%, 100% 100%, 0 100%, 0 40%, 20% 40%)';
      default:
        return '';
    }
  };

  return (
    <div
      ref={blockRef}
      className={`
        block absolute cursor-move select-none
        ${isDragging ? 'dragging' : ''}
        ${!isValidPosition ? 'invalid-position' : ''}
      `}
      style={{
        left: `${block.x}px`,
        top: `${block.y}px`,
        width: `${block.width}px`,
        height: `${block.height}px`,
        backgroundColor: block.color,
        ...getShapeStyles()
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
        {block.id}
      </div>
    </div>
  );
}