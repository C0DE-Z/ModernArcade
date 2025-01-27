'use client';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function GameTabs() {
  const router = useRouter();
  const pathname = usePathname();

  const games = [
    { id: 'home', name: 'Home', path: '/', ready: true },
    { id: 'minesweeper', name: 'Minesweeper', path: '/minesweeper', ready: true },
    { id: '2048', name: '2048', path: '/2048', ready: true },
    { id: 'blackjack', name: 'Blackjack', path: '/blackjack', ready: true },
    { id: 'snake', name: 'Snake', path: '/snake', ready: true },
    { id: 'pacman', name: 'Pac-Man', path: '/pacman', ready: true },
    { id: 'pong', name: 'Pong', path: '/pong', ready: true },
    { id: 'tictactoe', name: 'Tic Tac Toe', path: '/tictactoe', ready: true },
    { id: 'solitaire', name: 'Solitaire', path: '/solitaire', ready: false },
    { id: 'poker', name: 'Poker', path: '/poker', ready: false },
    { id: 'breakout', name: 'Breakout', path: '/breakout', ready: true },
  ];
                                                                    
  return (
    <div className="fixed top-0 left-0 w-full bg-gray-900 border-b border-gray-700 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center h-16 gap-8">
          <h1 className="text-xl font-bold text-white">Modern Arcade</h1>
          <nav className="flex gap-4">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => game.ready && router.push(game.path)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  pathname === game.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                } ${!game.ready && 'opacity-50 cursor-not-allowed'}`}
              >
                {game.name}
                {!game.ready && ' 🚧'}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
