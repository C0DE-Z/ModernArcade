'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, createDeck } from '../utils/cards';
import PlayingCard from '../components/PlayingCard';

export default function Blackjack() {
  const [mounted, setMounted] = useState(false);
  const [deck, setDeck] = useState<Deck>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealerTurn' | 'gameOver'>('betting');
  const [chips, setChips] = useState(1000);
  const [bet, setBet] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMounted(true);
    resetGame();
  }, []);

  if (!mounted) return null;

  function resetGame() {
    setDeck(createDeck());
    setPlayerHand([]);
    setDealerHand([]);
    setGameState('betting');
    setBet(0);
    setMessage('Place your bet!');
  }

  function placeBet(amount: number) {
    if (chips >= amount) {
      setBet(amount);
      setChips(chips - amount);
      dealInitialCards();
    }
  }

  function dealCard(hand: Card[]): [Card[], Card] {
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    setDeck(newDeck);
    return [[...hand, card], card];
  }

  function dealInitialCards() {
    const newDeck = [...deck];
    const pHand = [newDeck.pop()!, newDeck.pop()!];
    const dHand = [newDeck.pop()!, newDeck.pop()!];
    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGameState('playing');
  }

  function calculateHand(hand: Card[]): number {
    let sum = 0;
    let aces = 0;
    for (const card of hand) {
      if (card.face === 'A') aces++;
      sum += card.value;
    }
    while (sum > 21 && aces > 0) {
      sum -= 10;
      aces--;
    }
    return sum;
  }

  async function dealerPlay() {
    setGameState('dealerTurn');
    let currentHand = [...dealerHand];
    while (calculateHand(currentHand) < 17) {
      const [newHand, _] = dealCard(currentHand);
      currentHand = newHand;
      setDealerHand(currentHand);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    determineWinner(currentHand);
  }

  function determineWinner(finalDealerHand: Card[]) {
    const playerScore = calculateHand(playerHand);
    const dealerScore = calculateHand(finalDealerHand);

    if (playerScore > 21) {
      setMessage('Bust! You lose!');
    } else if (dealerScore > 21) {
      setMessage('Dealer busts! You win!');
      setChips(chips + bet * 2);
    } else if (playerScore > dealerScore) {
      setMessage('You win!');
      setChips(chips + bet * 2);
    } else if (dealerScore > playerScore) {
      setMessage('Dealer wins!');
    } else {
      setMessage('Push!');
      setChips(chips + bet);
    }
    setGameState('gameOver');
  }

  function hit() {
    const [newHand, _] = dealCard(playerHand);
    setPlayerHand(newHand);
    if (calculateHand(newHand) > 21) {
      setMessage('Bust! You lose!');
      setGameState('gameOver');
    }
  }

  return (
    <div className="pt-20 p-8 min-h-screen bg-gradient-to-b from-green-900 to-green-800">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Blackjack</h2>
          <p className="text-gray-400">Chips: ${chips}</p>
          {gameState === 'betting' && (
            <div className="mt-4 space-x-4">
              {[10, 25, 50, 100].map(amount => (
                <motion.button
                  key={amount}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => placeBet(amount)}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  disabled={chips < amount}
                >
                  ${amount}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-green-800/50 p-6 rounded-2xl backdrop-blur-sm">
            <h3 className="text-white mb-4">Dealer {gameState !== 'playing' && `(${calculateHand(dealerHand)})`}</h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {dealerHand.map((card, i) => (
                <PlayingCard
                  key={i}
                  card={card}
                  hidden={i === 0 && gameState === 'playing'}
                  revealed={gameState !== 'playing'}
                />
              ))}
            </div>
          </div>

          <div className="bg-green-800/50 p-6 rounded-2xl backdrop-blur-sm">
            <h3 className="text-white mb-4">Player ({calculateHand(playerHand)})</h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {playerHand.map((card, i) => (
                <PlayingCard key={i} card={card} />
              ))}
            </div>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="mt-8 space-x-4 text-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={hit}
              className="px-6 py-2 bg-blue-600 text-white rounded"
            >
              Hit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => dealerPlay()}
              className="px-6 py-2 bg-blue-600 text-white rounded"
            >
              Stand
            </motion.button>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="mt-8 text-center">
            <p className="text-xl text-white mb-4">{message}</p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={resetGame}
              className="px-6 py-2 bg-blue-600 text-white rounded"
            >
              Play Again
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
