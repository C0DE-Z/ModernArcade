'use client';

import { useState, useEffect } from 'react';

type Card = {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const CARD_VALUES = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍍', '🥝'];

export default function MemoryGamePage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [moves, setMoves] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffledCards = [...CARD_VALUES, ...CARD_VALUES]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setIsGameOver(false);
  };

  const handleCardClick = (card: Card) => {
    if (card.isFlipped || card.isMatched || flippedCards.length === 2) return;

    const newCards = cards.map(c =>
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);
    setFlippedCards([...flippedCards, card]);

    if (flippedCards.length === 1) {
      setMoves(moves + 1);
      if (flippedCards[0].value === card.value) {
        setCards(prevCards =>
          prevCards.map(c =>
            c.value === card.value ? { ...c, isMatched: true } : c
          )
        );
        setFlippedCards([]);
        if (newCards.every(c => c.isMatched)) {
          setIsGameOver(true);
        }
      } else {
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(c =>
              c.id === card.id || c.id === flippedCards[0].id
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="pt-20 p-8 min-h-screen bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Memory Game</h2>
          <button
            onClick={initializeGame}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            New Game
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {cards.map(card => (
            <div
              key={card.id}
              className={`w-20 h-20 flex items-center justify-center text-2xl font-bold rounded-lg cursor-pointer
                ${card.isFlipped || card.isMatched ? 'bg-white text-black' : 'bg-gray-500'}`}
              onClick={() => handleCardClick(card)}
            >
              {card.isFlipped || card.isMatched ? card.value : ''}
            </div>
          ))}
        </div>

        <div className="mt-4 text-center text-white text-xl">
          Moves: {moves}
        </div>

        {isGameOver && (
          <div className="mt-4 text-center text-white text-xl">
            You Win! Congratulations!
          </div>
        )}
      </div>
    </div>
  );
}
