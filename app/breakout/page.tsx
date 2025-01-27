'use client';

import { useEffect, useState, useCallback } from 'react';
import { useInterval } from '../hooks/useInterval';

type Brick = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  visible: boolean;
};

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 10;
const BALL_SIZE = 10;
const BALL_SPEED = 5;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_HEIGHT = 30;
const COLORS = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF'];

export default function BreakoutPage() {
  const [paddle, setPaddle] = useState({ x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 });
  const [ball, setBall] = useState({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, dx: BALL_SPEED, dy: -BALL_SPEED });
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize bricks
  useEffect(() => {
    const newBricks: Brick[] = [];
    const brickWidth = CANVAS_WIDTH / BRICK_COLS;
    
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        newBricks.push({
          x: col * brickWidth,
          y: row * BRICK_HEIGHT + 50,
          width: brickWidth - 4,
          height: BRICK_HEIGHT - 4,
          color: COLORS[row],
          visible: true
        });
      }
    }
    setBricks(newBricks);
  }, []);

  const updateGame = useCallback(() => {
    if (!gameStarted || isGameOver) return;

    // Move ball first
    const nextBallPos = {
      x: ball.x + ball.dx,
      y: ball.y + ball.dy
    };

    // Ball collision with walls
    if (nextBallPos.x <= 0 || nextBallPos.x >= CANVAS_WIDTH - BALL_SIZE) {
      setBall(prevBall => ({ ...prevBall, dx: -prevBall.dx }));
      nextBallPos.x = ball.x - ball.dx; // Reverse the movement
    }
    if (nextBallPos.y <= 0) {
      setBall(prevBall => ({ ...prevBall, dy: -prevBall.dy }));
      nextBallPos.y = ball.y - ball.dy; // Reverse the movement
    }

    // Ball collision with paddle
    if (
      nextBallPos.y >= paddle.y - BALL_SIZE &&
      nextBallPos.y <= paddle.y + PADDLE_HEIGHT &&
      nextBallPos.x >= paddle.x &&
      nextBallPos.x <= paddle.x + PADDLE_WIDTH
    ) {
      const hitPosition = (nextBallPos.x - paddle.x) / PADDLE_WIDTH;
      const maxAngle = Math.PI / 3;
      const angle = (hitPosition - 0.5) * maxAngle;
      const speed = 5; // Fixed speed after paddle hit

      setBall(prevBall => ({
        ...prevBall,
        y: paddle.y - BALL_SIZE, // Ensure ball doesn't get stuck in paddle
        dy: -Math.abs(speed * Math.cos(angle)),
        dx: speed * Math.sin(angle)
      }));
      return; // Exit early to prevent further collisions
    }

    // Ball collision with bricks
    setBricks(prevBricks => {
      let collided = false;
      const newBricks = prevBricks.map(brick => {
        if (!brick.visible) return brick;

        // Calculate collision bounds
        const ballRight = nextBallPos.x + BALL_SIZE;
        const ballBottom = nextBallPos.y + BALL_SIZE;
        const brickRight = brick.x + brick.width;
        const brickBottom = brick.y + brick.height;

        // Check for collision
        if (
          nextBallPos.x < brickRight &&
          ballRight > brick.x &&
          nextBallPos.y < brickBottom &&
          ballBottom > brick.y
        ) {
          // Determine collision side
          const fromLeft = ball.x + BALL_SIZE <= brick.x;
          const fromRight = ball.x >= brickRight;
          const fromTop = ball.y + BALL_SIZE <= brick.y;
          const fromBottom = ball.y >= brickBottom;

          // Set new ball direction
          if ((fromLeft || fromRight) && !fromTop && !fromBottom) {
            setBall(prevBall => ({ ...prevBall, dx: -prevBall.dx }));
          } else {
            setBall(prevBall => ({ ...prevBall, dy: -prevBall.dy }));
          }

          collided = true;
          setScore(prev => prev + 10);
          return { ...brick, visible: false };
        }
        return brick;
      });

      if (collided && newBricks.every(brick => !brick.visible)) {
        setIsGameOver(true);
      }

      return newBricks;
    });

    // Update ball position if no collisions occurred
    if (!isGameOver) {
      setBall(prevBall => ({
        ...prevBall,
        x: nextBallPos.x,
        y: nextBallPos.y
      }));
    }

    // Game over if ball hits bottom
    if (nextBallPos.y >= CANVAS_HEIGHT) {
      setIsGameOver(true);
    }
  }, [ball, paddle, gameStarted, isGameOver]);

  useInterval(updateGame, 16); // ~60fps

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isGameOver) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setPaddle(prev => ({
      ...prev,
      x: Math.min(Math.max(0, x - PADDLE_WIDTH / 2), CANVAS_WIDTH - PADDLE_WIDTH)
    }));
  }, [isGameOver]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Breakout</h1>
          <div className="text-2xl font-semibold text-blue-400">Score: {score}</div>
        </div>

        <div className="relative">
          <div 
            className="bg-black rounded-xl shadow-2xl overflow-hidden cursor-none"
            style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
            onMouseMove={handleMouseMove}
            onClick={() => !gameStarted && setGameStarted(true)}
          >
            {/* Game elements */}
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              {/* Bricks */}
              {bricks.map((brick, index) => (
                brick.visible && (
                  <div
                    key={index}
                    style={{
                      position: 'absolute',
                      left: brick.x,
                      top: brick.y,
                      width: brick.width,
                      height: brick.height,
                      backgroundColor: brick.color,
                      borderRadius: '4px',
                    }}
                  />
                )
              ))}

              {/* Paddle */}
              <div
                style={{
                  position: 'absolute',
                  left: paddle.x,
                  top: paddle.y,
                  width: PADDLE_WIDTH,
                  height: PADDLE_HEIGHT,
                  backgroundColor: 'white',
                  borderRadius: '4px',
                }}
              />

              {/* Ball */}
              <div
                style={{
                  position: 'absolute',
                  left: ball.x,
                  top: ball.y,
                  width: BALL_SIZE,
                  height: BALL_SIZE,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                }}
              />

              {/* Start prompt */}
              {!gameStarted && !isGameOver && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">
                  Click to Start
                </div>
              )}

              {/* Game over overlay */}
              {isGameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                      {bricks.every(brick => !brick.visible) ? 'You Win!' : 'Game Over!'}
                    </h2>
                    <p className="text-xl text-blue-400 mb-4">Final Score: {score}</p>
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
          </div>
        </div>

        <div className="text-center text-gray-400">
          <p>Move the paddle with your mouse to bounce the ball and break all bricks</p>
        </div>
      </div>
    </div>
  );
}
