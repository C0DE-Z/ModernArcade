'use client';
import { useState, useCallback } from 'react';

type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

export default function Minesweeper() {
  const [size] = useState(10);
  const [mines] = useState(15);
  const [gameOver, setGameOver] = useState(false);
  const [board, setBoard] = useState<CellState[][]>(() => initializeBoard());

  function initializeBoard() {
    // Create empty board
    const newBoard: CellState[][] = Array(size).fill(null).map(() =>
      Array(size).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      if (!newBoard[x][y].isMine) {
        newBoard[x][y].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor mines
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!newBoard[i][j].isMine) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (ni >= 0 && ni < size && nj >= 0 && nj < size && newBoard[ni][nj].isMine) {
                count++;
              }
            }
          }
          newBoard[i][j].neighborMines = count;
        }
      }
    }
    return newBoard;
  }

  const handleCellClick = (i: number, j: number) => {
    if (gameOver || board[i][j].isRevealed || board[i][j].isFlagged) return;

    const newBoard = [...board.map(row => [...row])];
    
    if (board[i][j].isMine) {
      setGameOver(true);
      revealAll(newBoard);
    } else {
      revealCell(newBoard, i, j);
    }
    
    setBoard(newBoard);
  };

  const handleRightClick = (e: React.MouseEvent, i: number, j: number) => {
    e.preventDefault();
    if (gameOver || board[i][j].isRevealed) return;

    const newBoard = [...board.map(row => [...row])];
    newBoard[i][j].isFlagged = !newBoard[i][j].isFlagged;
    setBoard(newBoard);
  };

  const revealCell = (board: CellState[][], i: number, j: number) => {
    if (i < 0 || i >= size || j < 0 || j >= size || board[i][j].isRevealed) return;
    
    board[i][j].isRevealed = true;
    
    if (board[i][j].neighborMines === 0) {
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          revealCell(board, i + di, j + dj);
        }
      }
    }
  };

  const revealAll = (board: CellState[][]) => {
    board.forEach(row => row.forEach(cell => cell.isRevealed = true));
  };

  const resetGame = () => {
    setGameOver(false);
    setBoard(initializeBoard());
  };

  return (
    <div className="pt-20 p-8 min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Minesweeper</h2>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            New Game
          </button>
        </div>
        
        <div className="grid gap-1 bg-gray-800 p-4 rounded-lg">
          {board.map((row, i) => (
            <div key={i} className="flex gap-1">
              {row.map((cell, j) => (
                <button
                  key={`${i}-${j}`}
                  onClick={() => handleCellClick(i, j)}
                  onContextMenu={(e) => handleRightClick(e, i, j)}
                  className={`w-10 h-10 flex items-center justify-center text-lg font-bold rounded
                    ${cell.isRevealed 
                      ? cell.isMine 
                        ? 'bg-red-500'
                        : 'bg-gray-600'
                      : 'bg-gray-400 hover:bg-gray-500'}`}
                >
                  {cell.isRevealed
                    ? cell.isMine 
                      ? '💣'
                      : cell.neighborMines > 0 
                        ? cell.neighborMines
                        : ''
                    : cell.isFlagged 
                      ? '🚩'
                      : ''}
                </button>
              ))}
            </div>
          ))}
        </div>
        
        {gameOver && (
          <div className="mt-4 text-center text-white text-xl">
            Game Over! Try again.
          </div>
        )}
      </div>
    </div>
  );
}
