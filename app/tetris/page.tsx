'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInterval } from '../hooks/useInterval';
import { createParticles, drawParticles, updateParticles } from '../utils/particles';
import { Particle } from '../utils/particles';

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 600;
const GRID_SIZE = 30;
const COLUMNS = CANVAS_WIDTH / GRID_SIZE;
const ROWS = CANVAS_HEIGHT / GRID_SIZE;

const SHAPES = [
  // I
  [
    [1, 1, 1, 1]
  ],
  // J
  [
    [1, 0, 0],
    [1, 1, 1]
  ],
  // L
  [
    [0, 0, 1],
    [1, 1, 1]
  ],
  // O
  [
    [1, 1],
    [1, 1]
  ],
  // S
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  // T
  [
    [0, 1, 0],
    [1, 1, 1]
  ],
  // Z
  [
    [1, 1, 0],
    [0, 1, 1]
  ]
];

const COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

type Position = { x: number; y: number };
type Shape = number[][];

export default function TetrisPage() {
  const [grid, setGrid] = useState<number[][]>(Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0)));
  const [currentShape, setCurrentShape] = useState<Shape>(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: Math.floor(COLUMNS / 2) - 1, y: 0 });
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const drawShape = useCallback((ctx: CanvasRenderingContext2D, shape: Shape, position: Position, color: string) => {
    shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillStyle = color;
          ctx.fillRect((position.x + x) * GRID_SIZE, (position.y + y) * GRID_SIZE, GRID_SIZE, GRID_SIZE);
          ctx.strokeStyle = '#000';
          ctx.strokeRect((position.x + x) * GRID_SIZE, (position.y + y) * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        }
      });
    });
  }, []);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillStyle = COLORS[cell - 1];
          ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
          ctx.strokeStyle = '#000';
          ctx.strokeRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        }
      });
    });
  }, [grid]);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawGrid(ctx);
    drawShape(ctx, currentShape, currentPosition, COLORS[SHAPES.indexOf(currentShape)]);
    drawParticles(ctx, particles);
  }, [drawGrid, drawShape, currentShape, currentPosition, particles]);

  const moveShape = useCallback((dx: number, dy: number) => {
    setCurrentPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const rotateShape = useCallback(() => {
    const newShape = currentShape[0].map((_, i) => currentShape.map(row => row[i])).reverse();
    setCurrentShape(newShape);
  }, [currentShape]);

  const checkCollision = useCallback((shape: Shape, position: Position) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] && (
          position.y + y >= ROWS ||
          position.x + x < 0 ||
          position.x + x >= COLUMNS ||
          grid[position.y + y][position.x + x] !== 0
        )) {
          return true;
        }
      }
    }
    return false;
  }, [grid]);

  const mergeShape = useCallback(() => {
    const newGrid = grid.map(row => [...row]);
    currentShape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          newGrid[currentPosition.y + y][currentPosition.x + x] = SHAPES.indexOf(currentShape) + 1;
        }
      });
    });
    setGrid(newGrid);
    console.log('Merged Shape:', newGrid);
  }, [grid, currentShape, currentPosition]);

  const clearLines = useCallback(() => {
    const newGrid = grid.filter(row => row.some(cell => cell === 0));
    const clearedLines = ROWS - newGrid.length;
    setScore(prev => prev + clearedLines * 100);
    setGrid([...Array(clearedLines).fill(Array(COLUMNS).fill(0)), ...newGrid]);
    setParticles(prev => [...prev, ...createParticles(clearedLines)]);
    console.log('Cleared Lines:', newGrid);
  }, [grid]);

  const dropShape = useCallback(() => {
    if (!checkCollision(currentShape, { x: currentPosition.x, y: currentPosition.y + 1 })) {
      moveShape(0, 1);
    } else {
      mergeShape();
      clearLines();
      setParticles(prev => [...prev, ...createParticles(1, currentPosition.x * GRID_SIZE, currentPosition.y * GRID_SIZE)]);
      setCurrentShape(SHAPES[Math.floor(Math.random() * SHAPES.length)]);
      setCurrentPosition({ x: Math.floor(COLUMNS / 2) - 1, y: 0 });
      if (checkCollision(currentShape, { x: Math.floor(COLUMNS / 2) - 1, y: 0 })) {
        setIsGameOver(true);
      }
    }
  }, [checkCollision, moveShape, mergeShape, clearLines, currentShape, currentPosition]);

  useInterval(dropShape, isGameOver ? null : 500);

  useEffect(() => {
    const canvas = document.getElementById('tetris-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      draw(ctx);
    }
  }, [draw]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => updateParticles(prev));
    }, 16); // ~60fps
    return () => clearInterval(interval);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (isGameOver) return;
    switch (event.key) {
      case 'ArrowLeft':
        if (!checkCollision(currentShape, { x: currentPosition.x - 1, y: currentPosition.y })) {
          moveShape(-1, 0);
        }
        break;
      case 'ArrowRight':
        if (!checkCollision(currentShape, { x: currentPosition.x + 1, y: currentPosition.y })) {
          moveShape(1, 0);
        }
        break;
      case 'ArrowDown':
        dropShape();
        break;
      case 'ArrowUp':
        rotateShape();
        break;
    }
  }, [isGameOver, checkCollision, currentShape, currentPosition, moveShape, dropShape, rotateShape]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const printGrid = useCallback(() => {
    console.log(grid.map(row => row.map(cell => (cell ? '■' : '□')).join(' ')).join('\n'));
  }, [grid]);

  useEffect(() => {
    printGrid();
  }, [grid, printGrid]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Tetris</h1>
          <div className="text-2xl font-semibold text-yellow-400">Score: {score}</div>
        </div>

        <div className="relative">
          <canvas id="tetris-canvas" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="bg-black rounded-xl shadow-2xl" />
          {isGameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-xl">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-gray-400">
          <p>Use arrow keys to move and rotate the blocks</p>
        </div>
      </div>
    </div>
  );
}
