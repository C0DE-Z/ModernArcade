'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInterval } from '../hooks/useInterval';

type Position = { x: number; y: number };
type Velocity = { dx: number; dy: number };

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 20;
const PLAYER_SPEED = 10;
const BULLET_WIDTH = 5;
const BULLET_HEIGHT = 10;
const BULLET_SPEED = 5;
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 20;
const ENEMY_SPEED = 2;
const ENEMY_ROWS = 5;
const ENEMY_COLUMNS = 10;

export default function SpaceInvadersPage() {
  const [player, setPlayer] = useState<Position>({ x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, y: CANVAS_HEIGHT - PLAYER_HEIGHT - 10 });
  const [bullets, setBullets] = useState<Position[]>([]);
  const [enemies, setEnemies] = useState<Position[]>([]);
  const [enemyDirection, setEnemyDirection] = useState<Velocity>({ dx: ENEMY_SPEED, dy: 0 });
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const initialEnemies = [];
    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLUMNS; col++) {
        initialEnemies.push({ x: col * (ENEMY_WIDTH + 10) + 30, y: row * (ENEMY_HEIGHT + 10) + 30 });
      }
    }
    setEnemies(initialEnemies);
  }, []);

  const movePlayer = useCallback((dx: number) => {
    setPlayer(prev => ({
      x: Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_WIDTH, prev.x + dx)),
      y: prev.y
    }));
  }, []);

  const shootBullet = useCallback(() => {
    setBullets(prev => [...prev, { x: player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2, y: player.y }]);
  }, [player]);

  const updateGame = useCallback(() => {
    if (isGameOver) return;

    // Move bullets
    setBullets(prevBullets => prevBullets.map(bullet => ({ x: bullet.x, y: bullet.y - BULLET_SPEED })).filter(bullet => bullet.y > 0));

    // Move enemies
    setEnemies(prevEnemies => {
      const newEnemies = prevEnemies.map(enemy => ({ x: enemy.x + enemyDirection.dx, y: enemy.y + enemyDirection.dy }));
      const hitLeftEdge = newEnemies.some(enemy => enemy.x <= 0);
      const hitRightEdge = newEnemies.some(enemy => enemy.x >= CANVAS_WIDTH - ENEMY_WIDTH);
      if (hitLeftEdge || hitRightEdge) {
        setEnemyDirection(prev => ({ dx: -prev.dx, dy: ENEMY_HEIGHT }));
      } else {
        setEnemyDirection(prev => ({ dx: prev.dx, dy: 0 }));
      }
      return newEnemies;
    });

    // Check for bullet-enemy collisions
    setEnemies(prevEnemies => {
      const remainingEnemies = prevEnemies.filter(enemy => {
        const hit = bullets.some(bullet => bullet.x >= enemy.x && bullet.x <= enemy.x + ENEMY_WIDTH && bullet.y >= enemy.y && bullet.y <= enemy.y + ENEMY_HEIGHT);
        if (hit) setScore(prev => prev + 100);
        return !hit;
      });
      if (remainingEnemies.length === 0) setIsGameOver(true);
      return remainingEnemies;
    });

    // Check for enemy-player collisions
    if (enemies.some(enemy => enemy.y + ENEMY_HEIGHT >= player.y)) {
      setIsGameOver(true);
    }
  }, [bullets, enemies, enemyDirection, player, isGameOver]);

  useInterval(updateGame, 16); // ~60fps

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        movePlayer(-PLAYER_SPEED);
        break;
      case 'ArrowRight':
        movePlayer(PLAYER_SPEED);
        break;
      case ' ':
        shootBullet();
        break;
    }
  }, [movePlayer, shootBullet]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Space Invaders</h1>
          <div className="text-2xl font-semibold text-green-400">Score: {score}</div>
        </div>

        <div className="relative">
          <div className="bg-black rounded-xl shadow-2xl overflow-hidden">
            <div style={{ 
              width: CANVAS_WIDTH, 
              height: CANVAS_HEIGHT, 
              position: 'relative',
              background: '#000'
            }}>
              {/* Player */}
              <div style={{
                position: 'absolute',
                left: player.x,
                top: player.y,
                width: PLAYER_WIDTH,
                height: PLAYER_HEIGHT,
                background: 'white',
              }} />

              {/* Bullets */}
              {bullets.map((bullet, index) => (
                <div key={index} style={{
                  position: 'absolute',
                  left: bullet.x,
                  top: bullet.y,
                  width: BULLET_WIDTH,
                  height: BULLET_HEIGHT,
                  background: 'red',
                }} />
              ))}

              {/* Enemies */}
              {enemies.map((enemy, index) => (
                <div key={index} style={{
                  position: 'absolute',
                  left: enemy.x,
                  top: enemy.y,
                  width: ENEMY_WIDTH,
                  height: ENEMY_HEIGHT,
                  background: 'green',
                }} />
              ))}
            </div>
          </div>

          {isGameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-xl">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
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
              <p>← - Move Left</p>
              <p>→ - Move Right</p>
              <p>Space - Shoot</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
