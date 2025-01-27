'use client';

import { useEffect, useState, useCallback } from 'react';
import { useInterval } from '../hooks/useInterval';

type Position = { x: number; y: number };
type Velocity = { dx: number; dy: number };

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 15;
const BALL_SIZE = 15;
const PADDLE_SPEED = 15;
const INITIAL_BALL_SPEED = 5;

export default function PongPage() {
  const [leftPaddle, setLeftPaddle] = useState({ x: 0, y: CANVAS_HEIGHT / 2 });
  const [rightPaddle, setRightPaddle] = useState({ x: CANVAS_WIDTH - PADDLE_WIDTH, y: CANVAS_HEIGHT / 2 });
  const [ball, setBall] = useState<Position>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
  const [ballVelocity, setBallVelocity] = useState<Velocity>({ dx: INITIAL_BALL_SPEED, dy: INITIAL_BALL_SPEED });
  const [scores, setScores] = useState({ left: 0, right: 0 });
  const [isGameOver, setIsGameOver] = useState(false);

  const resetBall = useCallback(() => {
    setBall({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
    setBallVelocity({
      dx: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      dy: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1)
    });
  }, []);

  const updateGame = useCallback(() => {
    if (isGameOver) return;

    // Update ball position
    setBall(prevBall => ({
      x: prevBall.x + ballVelocity.dx,
      y: prevBall.y + ballVelocity.dy
    }));

    // Ball collision with top and bottom
    if (ball.y <= 0 || ball.y >= CANVAS_HEIGHT - BALL_SIZE) {
      setBallVelocity(prev => ({ ...prev, dy: -prev.dy }));
    }

    // Ball collision with paddles
    const hitLeftPaddle = ball.x <= PADDLE_WIDTH && 
                         ball.y >= leftPaddle.y && 
                         ball.y <= leftPaddle.y + PADDLE_HEIGHT;
    
    const hitRightPaddle = ball.x >= CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE && 
                          ball.y >= rightPaddle.y && 
                          ball.y <= rightPaddle.y + PADDLE_HEIGHT;

    if (hitLeftPaddle || hitRightPaddle) {
      setBallVelocity(prev => ({ 
        dx: -prev.dx * 1.1, // Increase speed slightly
        dy: prev.dy * 1.1
      }));
    }

    // Scoring
    if (ball.x <= 0) {
      setScores(prev => ({ ...prev, right: prev.right + 1 }));
      resetBall();
    } else if (ball.x >= CANVAS_WIDTH) {
      setScores(prev => ({ ...prev, left: prev.left + 1 }));
      resetBall();
    }

    // Check for game over
    if (scores.left >= 11 || scores.right >= 11) {
      setIsGameOver(true);
    }
  }, [ball, ballVelocity, leftPaddle, rightPaddle, scores, isGameOver, resetBall]);

  useInterval(updateGame, 16); // ~60fps

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'w':
        setLeftPaddle(prev => ({
          ...prev,
          y: Math.max(0, prev.y - PADDLE_SPEED)
        }));
        break;
      case 's':
        setLeftPaddle(prev => ({
          ...prev,
          y: Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, prev.y + PADDLE_SPEED)
        }));
        break;
      case 'ArrowUp':
        setRightPaddle(prev => ({
          ...prev,
          y: Math.max(0, prev.y - PADDLE_SPEED)
        }));
        break;
      case 'ArrowDown':
        setRightPaddle(prev => ({
          ...prev,
          y: Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, prev.y + PADDLE_SPEED)
        }));
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Pong</h1>
          <div className="text-2xl font-semibold text-blue-400 flex justify-center gap-8">
            <span>Player 1: {scores.left}</span>
            <span>Player 2: {scores.right}</span>
          </div>
        </div>

        <div className="relative">
          <div className="bg-black rounded-xl shadow-2xl overflow-hidden">
            <div style={{ 
              width: CANVAS_WIDTH, 
              height: CANVAS_HEIGHT, 
              position: 'relative',
              background: '#000'
            }}>
              {/* Center line */}
              <div className="absolute h-full w-0.5 left-1/2 bg-gray-700" />
              
              {/* Left paddle */}
              <div style={{
                position: 'absolute',
                left: leftPaddle.x,
                top: leftPaddle.y,
                width: PADDLE_WIDTH,
                height: PADDLE_HEIGHT,
                background: 'white',
              }} />

              {/* Right paddle */}
              <div style={{
                position: 'absolute',
                left: rightPaddle.x,
                top: rightPaddle.y,
                width: PADDLE_WIDTH,
                height: PADDLE_HEIGHT,
                background: 'white',
              }} />

              {/* Ball */}
              <div style={{
                position: 'absolute',
                left: ball.x,
                top: ball.y,
                width: BALL_SIZE,
                height: BALL_SIZE,
                background: 'white',
                borderRadius: '50%',
              }} />
            </div>
          </div>

          {isGameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-xl">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {scores.left > scores.right ? 'Player 1' : 'Player 2'} Wins!
                </h2>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-gray-400">
          <p className="mb-2">Controls:</p>
          <div className="flex justify-center gap-8">
            <div>
              <p>Player 1</p>
              <p>W - Up</p>
              <p>S - Down</p>
            </div>
            <div>
              <p>Player 2</p>
              <p>↑ - Up</p>
              <p>↓ - Down</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
