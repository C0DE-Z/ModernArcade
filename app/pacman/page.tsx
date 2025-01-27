'use client';

import { useEffect, useState, useCallback } from 'react';
import { useInterval } from '../hooks/useInterval';

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const CELL_SIZE = 30;
const INITIAL_SPEED = 200;

const createInitialGrid = () => {
  return Array(GRID_SIZE).fill(null).map(() => 
    Array(GRID_SIZE).fill('dot')
  );
};

export default function PacmanPage() {
  const [pacman, setPacman] = useState<Position>({ x: 10, y: 10 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [grid, setGrid] = useState(createInitialGrid());
  const [score, setScore] = useState(0);
  const [ghosts, setGhosts] = useState<Position[]>([
    { x: 1, y: 1 },
    { x: GRID_SIZE - 2, y: 1 },
    { x: 1, y: GRID_SIZE - 2 },
    { x: GRID_SIZE - 2, y: GRID_SIZE - 2 }
  ]);
  const [isGameOver, setIsGameOver] = useState(false);

  const moveGhosts = useCallback(() => {
    if (isGameOver) return;
    
    setGhosts(prevGhosts => prevGhosts.map(ghost => {
      const possibleMoves = [
        { x: ghost.x + 1, y: ghost.y },
        { x: ghost.x - 1, y: ghost.y },
        { x: ghost.x, y: ghost.y + 1 },
        { x: ghost.x, y: ghost.y - 1 }
      ].filter(move => 
        move.x >= 0 && move.x < GRID_SIZE && 
        move.y >= 0 && move.y < GRID_SIZE
      );

      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      return randomMove;
    }));
  }, [isGameOver]);

  const movePacman = useCallback(() => {
    if (isGameOver) return;

    const newPosition = { ...pacman };
    switch (direction) {
      case 'UP': newPosition.y = Math.max(0, pacman.y - 1); break;
      case 'DOWN': newPosition.y = Math.min(GRID_SIZE - 1, pacman.y + 1); break;
      case 'LEFT': newPosition.x = Math.max(0, pacman.x - 1); break;
      case 'RIGHT': newPosition.x = Math.min(GRID_SIZE - 1, pacman.x + 1); break;
    }

    if (grid[newPosition.y][newPosition.x] === 'dot') {
      const newGrid = [...grid];
      newGrid[newPosition.y][newPosition.x] = 'empty';
      setGrid(newGrid);
      setScore(prev => prev + 10);
    }

    if (ghosts.some(ghost => ghost.x === newPosition.x && ghost.y === newPosition.y)) {
      setIsGameOver(true);
      return;
    }

    setPacman(newPosition);
  }, [pacman, direction, grid, ghosts, isGameOver]);

  useInterval(movePacman, INITIAL_SPEED);
  useInterval(moveGhosts, INITIAL_SPEED * 2);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp': setDirection('UP'); break;
      case 'ArrowDown': setDirection('DOWN'); break;
      case 'ArrowLeft': setDirection('LEFT'); break;
      case 'ArrowRight': setDirection('RIGHT'); break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Pac-Man</h1>
          <div className="text-2xl font-semibold text-yellow-400">Score: {score}</div>
        </div>

        <div className="relative">
          <div className="bg-blue-900 p-4 rounded-xl shadow-2xl">
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
              gap: 1,
              backgroundColor: '#1a1a1a',
              padding: '8px',
              borderRadius: '8px',
            }}>
              {grid.map((row, y) => row.map((cell, x) => {
                const isPacman = pacman.x === x && pacman.y === y;
                const isGhost = ghosts.some(ghost => ghost.x === x && ghost.y === y);
                const isDot = cell === 'dot';
                return (
                  <div
                    key={`${x}-${y}`}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: '#000',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isPacman && <div className="text-2xl">😮</div>}
                    {isGhost && <div className="text-2xl">👻</div>}
                    {!isPacman && !isGhost && isDot && (
                      <div className="w-2 h-2 bg-yellow-200 rounded-full" />
                    )}
                  </div>
                );
              }))}
            </div>
          </div>

          {isGameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-xl">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-gray-400">
          <p className="mb-2">Use arrow keys to move Pac-Man</p>
          <div className="flex justify-center gap-4">
            <div className="px-4 py-2 bg-gray-800 rounded-lg">↑</div>
            <div className="px-4 py-2 bg-gray-800 rounded-lg">↓</div>
            <div className="px-4 py-2 bg-gray-800 rounded-lg">←</div>
            <div className="px-4 py-2 bg-gray-800 rounded-lg">→</div>
          </div>
        </div>
      </div>
    </div>
  );
}
