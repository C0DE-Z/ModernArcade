'use client';

import { useEffect, useState, useCallback } from 'react';
import { useInterval } from '../hooks/useInterval';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const BIRD_SIZE = 30;
const GRAVITY = 0.5;
const JUMP_STRENGTH = 10;
const PIPE_WIDTH = 60;
const PIPE_GAP = 200;
const PIPE_SPEED = 3;

type Bird = {
  x: number;
  y: number;
  dy: number;
};

type Pipe = {
  x: number;
  height: number;
};

export default function FlappyBirdPage() {
  const [bird, setBird] = useState<Bird>({ x: 100, y: CANVAS_HEIGHT / 2, dy: 0 });
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const generatePipe = useCallback(() => {
    const height = Math.floor(Math.random() * (CANVAS_HEIGHT - PIPE_GAP));
    return { x: CANVAS_WIDTH, height };
  }, []);

  const updateGame = useCallback(() => {
    if (!gameStarted || isGameOver) return;

    // Update bird position
    setBird(prevBird => {
      const newY = prevBird.y + prevBird.dy;
      const newDy = prevBird.dy + GRAVITY;
      return { ...prevBird, y: newY, dy: newDy };
    });

    // Update pipes position
    setPipes(prevPipes => {
      const newPipes = prevPipes.map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }));
      if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < CANVAS_WIDTH - 300) {
        newPipes.push(generatePipe());
      }
      return newPipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);
    });

    // Check for collisions
    setBird(prevBird => {
      if (prevBird.y + BIRD_SIZE > CANVAS_HEIGHT || prevBird.y < 0) {
        setIsGameOver(true);
      }
      return prevBird;
    });

    setPipes(prevPipes => {
      for (const pipe of prevPipes) {
        if (
          bird.x + BIRD_SIZE > pipe.x &&
          bird.x < pipe.x + PIPE_WIDTH &&
          (bird.y < pipe.height || bird.y + BIRD_SIZE > pipe.height + PIPE_GAP)
        ) {
          setIsGameOver(true);
        }
      }
      return prevPipes;
    });

    // Update score
    setPipes(prevPipes => {
      for (const pipe of prevPipes) {
        if (pipe.x + PIPE_WIDTH === bird.x) {
          setScore(prevScore => prevScore + 1);
        }
      }
      return prevPipes;
    });
  }, [bird, gameStarted, isGameOver, generatePipe]);

  useInterval(updateGame, 16); // ~60fps

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === ' ') {
      setBird(prevBird => ({ ...prevBird, dy: -JUMP_STRENGTH }));
      if (!gameStarted) setGameStarted(true);
    }
  }, [gameStarted]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const resetGame = () => {
    setBird({ x: 100, y: CANVAS_HEIGHT / 2, dy: 0 });
    setPipes([]);
    setScore(0);
    setIsGameOver(false);
    setGameStarted(false);
  };

  return (
    <div className="min-h-screen bg-blue-500 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Flappy Bird</h1>
          <div className="text-2xl font-semibold text-yellow-400">Score: {score}</div>
        </div>

        <div className="relative">
          <div className="bg-blue-700 rounded-xl shadow-2xl overflow-hidden" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
            {/* Bird */}
            <div
              style={{
                position: 'absolute',
                left: bird.x,
                top: bird.y,
                width: BIRD_SIZE,
                height: BIRD_SIZE,
                backgroundColor: 'yellow',
                borderRadius: '50%',
              }}
            />

            {/* Pipes */}
            {pipes.map((pipe, index) => (
              <div key={index}>
                <div
                  style={{
                    position: 'absolute',
                    left: pipe.x,
                    top: 0,
                    width: PIPE_WIDTH,
                    height: pipe.height,
                    backgroundColor: 'green',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: pipe.x,
                    top: pipe.height + PIPE_GAP,
                    width: PIPE_WIDTH,
                    height: CANVAS_HEIGHT - pipe.height - PIPE_GAP,
                    backgroundColor: 'green',
                  }}
                />
              </div>
            ))}

            {/* Start prompt */}
            {!gameStarted && !isGameOver && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">
                Press Space to Start
              </div>
            )}

            {/* Game over overlay */}
            {isGameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
                  <p className="text-xl text-yellow-400 mb-4">Final Score: {score}</p>
                  <button
                    onClick={resetGame}
                    className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-gray-400">
          <p>Press Space to make the bird jump and avoid the pipes</p>
        </div>
      </div>
    </div>
  );
}
