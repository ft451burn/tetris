# Interlocking Blocks Stacking

## Problem Solved
This project addresses the issue described as "nadal potrafi nachodzic na siebie, klocek na klocek wchodzi jeden w drugi" (blocks still overlap/clip through each other) by implementing proper collision detection and physics for a block stacking system.

## Features

### Collision Detection System
- **Real-time collision detection**: Prevents blocks from overlapping during drag operations
- **Visual feedback**: Invalid positions are highlighted with red borders
- **Boundary checking**: Ensures blocks stay within the container bounds

### Advanced Block Physics
- **Gravity simulation**: Blocks automatically fall to the lowest valid position when released
- **Grid alignment**: Blocks snap to a grid for precise positioning
- **Interlocking mechanism**: Blocks can snap to adjacent blocks for puzzle-like behavior

### Interactive Features
- **Drag and drop**: Smooth mouse-based interaction for moving blocks
- **Multiple block shapes**: Square, rectangle, L-shape, and T-shape blocks
- **Visual state feedback**: Different visual states for dragging, valid, and invalid positions
- **Reset functionality**: Easy way to restore blocks to initial positions

## Technical Implementation

### Core Components
1. **Collision Detection** (`src/utils/collision.ts`)
   - `checkCollision()`: Detects overlap between two blocks
   - `checkCollisionAtPosition()`: Tests collision at a specific position
   - `findLowestValidPosition()`: Implements gravity physics
   - `getSnapPosition()`: Enables block-to-block snapping
   - `alignToGrid()`: Provides precise grid-based positioning

2. **Block Component** (`src/components/Block.tsx`)
   - Handles individual block rendering and drag interactions
   - Manages visual states (dragging, valid/invalid positions)
   - Supports different block shapes with CSS clip-path

3. **Stacking Game** (`src/components/StackingGame.tsx`)
   - Manages multiple blocks and their interactions
   - Orchestrates collision detection and physics
   - Provides game state management

## How It Prevents Overlapping

1. **Pre-collision Detection**: Before allowing a block to be placed, the system checks for collisions
2. **Visual Warnings**: Invalid positions are immediately highlighted to the user
3. **Automatic Correction**: Gravity pulls blocks to valid positions
4. **Snap-to-Grid**: Ensures precise alignment and reduces floating-point positioning errors
5. **Boundary Enforcement**: Blocks cannot be moved outside the container

## Usage

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## Controls
- **Drag blocks** to move them around
- **Red border** indicates invalid placement (collision or out of bounds)
- **Blocks automatically fall** when released (gravity simulation)
- **Snap to nearby blocks** for interlocking behavior
- **Click Reset** to restore blocks to initial positions

## Technology Stack
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Custom Physics Engine**: Real-time collision detection and gravity simulation

This solution completely eliminates the block overlapping issue by implementing comprehensive collision detection, visual feedback, and automatic position correction.