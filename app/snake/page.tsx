'use client';

import { useEffect, useState, useCallback } from 'react';
import { useInterval } from '../hooks/useInterval';

type Position = {
  x: number;
  y: number;
};

const GRID_SIZE = 20;
const CELL_SIZE = 25; // Increased cell size
const INITIAL_SPEED = 200;

export default function SnakePage() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('RIGHT');
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    setFood(newFood);
  }, []);

  const moveSnake = useCallback(() => {
    if (isGameOver) return;

    const head = { ...snake[0] };
    switch (direction) {
      case 'UP': head.y--; break;
      case 'DOWN': head.y++; break;
      case 'LEFT': head.x--; break;
      case 'RIGHT': head.x++; break;
    }

    const newSnake = [head, ...snake.slice(0, -1)];

    if (head.x === food.x && head.y === food.y) {
      newSnake.push(snake[snake.length - 1]);
      setScore(score + 1);
      generateFood();
    }

    if (
      head.x < 0 || head.x >= GRID_SIZE ||
      head.y < 0 || head.y >= GRID_SIZE ||
      newSnake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
    ) {
      setIsGameOver(true);
      return;
    }

    setSnake(newSnake);
  }, [snake, direction, food, isGameOver, score, generateFood]);

  useInterval(moveSnake, INITIAL_SPEED);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
      case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
      case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
      case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
    }
  }, [direction]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Snake Game</h1>
          <div className="text-2xl font-semibold text-emerald-400">Score: {score}</div>
        </div>

        <div className="relative">
          <div className="bg-gray-800 p-4 rounded-xl shadow-2xl">
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
              gap: 1,
              backgroundColor: '#1a1a1a',
              padding: '8px',
              borderRadius: '8px',
            }}>
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                const x = index % GRID_SIZE;
                const y = Math.floor(index / GRID_SIZE);
                const isSnake = snake.some(segment => segment.x === x && segment.y === y);
                const isFood = food.x === x && food.y === y;
                return (
                  <div
                    key={index}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: isSnake ? '#10B981' : isFood ? '#EF4444' : '#262626',
                      borderRadius: '4px',
                      transition: 'background-color 0.1s ease',
                    }}
                  />
                );
              })}
            </div>
          </div>

          {isGameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-xl">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-gray-400">
          <p className="mb-2">Use arrow keys to control the snake</p>
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
