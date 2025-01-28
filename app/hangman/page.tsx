'use client';

import { useState, useEffect, useCallback } from 'react';

const words = ['javascript', 'typescript', 'react', 'nextjs', 'nodejs', 'express', 'mongodb', 'graphql'];

export default function HangmanPage() {
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);

  useEffect(() => {
    setWord(words[Math.floor(Math.random() * words.length)]);
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (isGameOver || isGameWon) return;

    const letter = event.key.toLowerCase();
    if (letter.match(/^[a-z]$/) && !guessedLetters.includes(letter)) {
      setGuessedLetters(prev => [...prev, letter]);

      if (!word.includes(letter)) {
        setWrongGuesses(prev => prev + 1);
      }
    }
  }, [isGameOver, isGameWon, guessedLetters, word]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (wrongGuesses >= 6) {
      setIsGameOver(true);
    } else if (word.split('').every(letter => guessedLetters.includes(letter))) {
      setIsGameWon(true);
    }
  }, [wrongGuesses, guessedLetters, word]);

  const resetGame = () => {
    setWord(words[Math.floor(Math.random() * words.length)]);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setIsGameOver(false);
    setIsGameWon(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Hangman</h1>
          <div className="text-2xl font-semibold text-yellow-400">Wrong Guesses: {wrongGuesses} / 6</div>
        </div>

        <div className="text-center text-white text-3xl font-mono">
          {word.split('').map((letter, index) => (
            <span key={index} className="border-b-2 border-white mx-1">
              {guessedLetters.includes(letter) ? letter : '_'}
            </span>
          ))}
        </div>

        <div className="text-center text-gray-400">
          <p>Press any letter key to guess</p>
        </div>

        {isGameOver && (
          <div className="text-center text-red-500">
            <p className="text-2xl font-bold">Game Over! The word was &quot;{word}&quot;.</p>
            <button
              onClick={resetGame}
              className="mt-4 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        {isGameWon && (
          <div className="text-center text-green-500">
            <p className="text-2xl font-bold">Congratulations! You guessed the word &quot;{word}&quot;.</p>
            <button
              onClick={resetGame}
              className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
