/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GRID_SIZE = 4;
const CELL_COLORS: { [key: number]: string } = {
  2: 'bg-orange-200 text-gray-800',
  4: 'bg-orange-300 text-gray-800',
  8: 'bg-orange-400 text-white',
  16: 'bg-orange-500 text-white',
  32: 'bg-orange-600 text-white',
  64: 'bg-orange-700 text-white',
  128: 'bg-yellow-500 text-white',
  256: 'bg-yellow-400 text-white',
  512: 'bg-yellow-300 text-gray-800',
  1024: 'bg-yellow-200 text-gray-800',
  2048: 'bg-yellow-100 text-gray-800',
};

export default function Game2048() {
  // Helper functions (not hooks)
  function initializeGrid() {
    const newGrid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
    addNewNumber(newGrid);
    addNewNumber(newGrid);
    return newGrid;
  }

  function addNewNumber(grid: number[][]) {
    const emptyCells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] === 0) emptyCells.push([i, j]);
      }
    }
    if (emptyCells.length > 0) {
      const [i, j] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  // 1. All useState hooks
  const [mounted, setMounted] = useState(false);
  const [grid, setGrid] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // 2. All useCallback hooks
  const canMove = useCallback((grid: number[][]) => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] === 0) return true;
        if (i < GRID_SIZE - 1 && grid[i][j] === grid[i + 1][j]) return true;
        if (j < GRID_SIZE - 1 && grid[i][j] === grid[i][j + 1]) return true;
      }
    }
    return false;
  }, []);

  const moveGrid = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    let newGrid = grid.map(row => [...row]);
    let moved = false;
    let newScore = score;

    const rotate = (grid: number[][]) => {
      const N = grid.length;
      const rotated = Array(N).fill(0).map(() => Array(N).fill(0));
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          rotated[j][N - 1 - i] = grid[i][j];
        }
      }
      return rotated;
    };

    // Align grid so we can always process left-to-right
    if (direction === 'up') newGrid = rotate(rotate(rotate(newGrid)));
    else if (direction === 'right') newGrid = rotate(rotate(newGrid));
    else if (direction === 'down') newGrid = rotate(newGrid);

    // Process each row
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = newGrid[i].filter(cell => cell !== 0);
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          newScore += row[j];
          row.splice(j + 1, 1);
          moved = true;
        }
      }
      const newRow = [...row, ...Array(GRID_SIZE - row.length).fill(0)];
      if (newRow.join(',') !== newGrid[i].join(',')) moved = true;
      newGrid[i] = newRow;
    }

    // Rotate back
    if (direction === 'up') newGrid = rotate(newGrid);
    else if (direction === 'right') newGrid = rotate(rotate(newGrid));
    else if (direction === 'down') newGrid = rotate(rotate(rotate(newGrid)));

    if (moved) {
      setTimeout(() => {
        addNewNumber(newGrid);
        setScore(newScore);
        setGrid(newGrid);

        if (!canMove(newGrid)) {
          setGameOver(true);
        }
      }, 150); // Match the slide transition duration
    }
  }, [canMove, grid, score]);

  // 3. All useEffect hooks
  useEffect(() => {
    setMounted(true);
    setGrid(initializeGrid());
  }, [initializeGrid]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;
      switch (e.key) {
        case 'ArrowUp': moveGrid('up'); break;
        case 'ArrowDown': moveGrid('down'); break;
        case 'ArrowLeft': moveGrid('left'); break;
        case 'ArrowRight': moveGrid('right'); break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveGrid, gameOver]);

  // Prevent hydration issues
  if (!mounted) return null;

  // Reset game function (not a hook)
  const resetGame = () => {
    setGrid(initializeGrid());
    setScore(0);
    setGameOver(false);
  };

  const slideTransition = {
    type: "spring",
    stiffness: 200,
    damping: 20,
    mass: 1
  };

  const appearTransition = {
    type: "spring",
    stiffness: 400,
    damping: 30
  };

  // Render JSX
  return (
    <div className="pt-20 p-8 min-h-screen bg-gray-900">
      <div className="max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-6"
        >
          <div>
            <h2 className="text-2xl font-bold text-white">2048</h2>
            <motion.p 
              key={score}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-gray-400"
            >
              Score: {score}
            </motion.p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            New Game
          </motion.button>
        </motion.div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="relative" style={{ paddingBottom: '100%' }}>
            {/* Static background grid */}
            <div className="absolute inset-0 grid grid-cols-4 gap-2">
              {Array(16).fill(null).map((_, i) => (
                <div
                  key={`bg-${i}`}
                  className="bg-gray-600/50 rounded-lg w-full h-full"
                />
              ))}
            </div>

            {/* Animated tiles */}
            <div className="absolute inset-0 grid grid-cols-4 gap-2">
              {grid.map((row, i) => 
                row.map((cell, j) => 
                  cell !== 0 && (
                    <motion.div
                      key={`${i}-${j}-${cell}`}
                      initial={{ scale: 0 }}
                      animate={{
                        scale: 1,
                        gridColumn: j + 1,
                        gridRow: i + 1,
                      }}
                      transition={slideTransition}
                      className={`${
                        CELL_COLORS[cell] || 'bg-gray-500'
                      } rounded-lg w-full h-full flex items-center justify-center text-2xl font-bold`}
                      layoutId={`tile-${i}-${j}`}
                    >
                      <motion.span
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={appearTransition}
                      >
                        {cell}
                      </motion.span>
                    </motion.div>
                  )
                )
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {gameOver && (
            <motion.div              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4 text-center text-white text-xl"
            >
              Game Over! Your score: {score}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
