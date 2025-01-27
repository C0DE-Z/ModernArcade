'use client';

import { useState, useCallback } from 'react';

type Player = 'X' | 'O';
type Cell = Player | null;

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export default function TicTacToePage() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);

  const checkWinner = useCallback((squares: Cell[]): Player | 'Draw' | null => {
    // Check for winner
    for (const [a, b, c] of WINNING_COMBINATIONS) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a] as Player;
      }
    }
    // Check for draw
    if (squares.every(square => square !== null)) {
      return 'Draw';
    }
    return null;
  }, []);

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      setWinner(gameResult);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Tic Tac Toe</h1>
          {!winner && (
            <p className="text-2xl text-blue-400">
              Current Player: {currentPlayer}
            </p>
          )}
          {winner && (
            <p className="text-2xl font-bold text-green-400">
              {winner === 'Draw' ? "It's a Draw!" : `Player ${winner} Wins!`}
            </p>
          )}
        </div>

        <div className="bg-gray-800 p-4 rounded-xl shadow-2xl">
          <div className="grid grid-cols-3 gap-4">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleClick(index)}
                disabled={!!cell || !!winner}
                className={`
                  w-24 h-24 text-5xl font-bold rounded-lg
                  transition-all duration-200 transform hover:scale-105
                  ${!cell && !winner ? 'hover:bg-gray-700' : ''}
                  ${cell === 'X' ? 'bg-blue-600 text-white' : ''}
                  ${cell === 'O' ? 'bg-red-600 text-white' : ''}
                  ${!cell ? 'bg-gray-700' : ''}
                `}
              >
                {cell}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={resetGame}
          className="w-full py-3 bg-green-600 text-white rounded-lg
                     hover:bg-green-700 transition-colors font-bold text-lg"
        >
          New Game
        </button>
      </div>
    </div>
  );
}
