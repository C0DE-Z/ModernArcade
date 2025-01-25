'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, createDeck } from '../utils/cards';
import PlayingCard from '../components/PlayingCard';

type PokerHand = 'High Card' | 'Pair' | 'Two Pair' | 'Three of a Kind' | 'Straight' | 'Flush' | 'Full House' | 'Four of a Kind' | 'Straight Flush';

export default function Poker() {
  const [mounted, setMounted] = useState(false);
  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<boolean[]>([]);
  const [chips, setChips] = useState(1000);
  const [bet, setBet] = useState(0);
  const [gamePhase, setGamePhase] = useState<'betting' | 'draw' | 'result'>('betting');
  const [handRank, setHandRank] = useState<PokerHand | null>(null);

  useEffect(() => {
    setMounted(true);
    resetGame();
  }, []);

  if (!mounted) return null;

  function resetGame() {
    setDeck(createDeck());
    setHand([]);
    setSelectedCards([]);
    setGamePhase('betting');
    setBet(0);
    setHandRank(null);
  }

  function dealInitialHand() {
    if (chips >= bet) {
      const newDeck = [...deck];
      const newHand = [];
      for (let i = 0; i < 5; i++) {
        newHand.push(newDeck.pop()!);
      }
      setDeck(newDeck);
      setHand(newHand);
      setSelectedCards(new Array(5).fill(false));
      setChips(chips - bet);
      setGamePhase('draw');
    }
  }

  function drawNewCards() {
    const newDeck = [...deck];
    const newHand = [...hand];
    selectedCards.forEach((selected, i) => {
      if (selected) {
        newHand[i] = newDeck.pop()!;
      }
    });
    setDeck(newDeck);
    setHand(newHand);
    setGamePhase('result');
    evaluateHand(newHand);
  }

  function evaluateHand(currentHand: Card[]) {
    const rank = evaluatePokerHand(currentHand);
    setHandRank(rank as PokerHand);
    awardWinnings(rank as PokerHand);
  }

  function evaluatePokerHand(hand: Card[]): string {
    const values = hand.map(card => card.value).sort((a, b) => a - b);
    const suits = hand.map(card => card.suit);

    const isFlush = suits.every(suit => suit === suits[0]);
    const isStraight = values.every((val, i) => i === 0 || val === values[i - 1] + 1);

    const valueCounts = values.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const counts = Object.values(valueCounts).sort((a, b) => b - a);

    if (isFlush && isStraight) return "Straight Flush";
    if (counts[0] === 4) return "Four of a Kind";
    if (counts[0] === 3 && counts[1] === 2) return "Full House";
    if (isFlush) return "Flush";
    if (isStraight) return "Straight";
    if (counts[0] === 3) return "Three of a Kind";
    if (counts[0] === 2 && counts[1] === 2) return "Two Pair";
    if (counts[0] === 2) return "Pair";
    return "High Card";
  }

  function awardWinnings(rank: PokerHand) {
    const multipliers: Record<PokerHand, number> = {
      'High Card': 0,
      'Pair': 1,
      'Two Pair': 2,
      'Three of a Kind': 3,
      'Straight': 4,
      'Flush': 5,
      'Full House': 8,
      'Four of a Kind': 25,
      'Straight Flush': 50
    };

    const winnings = bet * multipliers[rank];
    if (winnings > 0) {
      setChips(chips + winnings);
    }
  }

  return (
    <div className="pt-20 p-8 min-h-screen bg-gradient-to-b from-blue-900 to-blue-800">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Five Card Draw</h2>
          <p className="text-gray-300">Chips: ${chips}</p>
          {gamePhase === 'betting' && (
            <div className="mt-4 space-x-4">
              {[10, 25, 50, 100].map(amount => (
                <motion.button
                  key={amount}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setBet(amount);
                    dealInitialHand();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  disabled={chips < amount}
                >
                  Bet ${amount}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-800/50 p-6 rounded-2xl backdrop-blur-sm">
          <div className="flex justify-center gap-4">
            {hand.map((card, i) => (
              <motion.div
                key={i}
                onClick={() => {
                  if (gamePhase === 'draw') {
                    const newSelected = [...selectedCards];
                    newSelected[i] = !newSelected[i];
                    setSelectedCards(newSelected);
                  }
                }}
                whileHover={gamePhase === 'draw' ? { y: selectedCards[i] ? 0 : -20 } : {}}
                animate={{ y: selectedCards[i] ? -20 : 0 }}
                className="cursor-pointer"
              >
                <PlayingCard card={card} />
              </motion.div>
            ))}
          </div>
        </div>

        {gamePhase === 'draw' && (
          <div className="mt-8 text-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={drawNewCards}
              className="px-6 py-2 bg-blue-600 text-white rounded"
            >
              Draw New Cards
            </motion.button>
          </div>
        )}

        {gamePhase === 'result' && (
          <div className="mt-8 text-center">
            <p className="text-xl text-white mb-4">
              {handRank && `You got: ${handRank}`}
            </p>
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
