'use client';
import { motion } from 'framer-motion';
import { Card, SUIT_SYMBOLS, SUIT_COLORS } from '../utils/cards';

interface PlayingCardProps {
  card?: Card;
  hidden?: boolean;
  revealed?: boolean;
}

export default function PlayingCard({ card, hidden = false, revealed = true }: PlayingCardProps) {
  if (!card) return null;

  const cardSpring = {
    type: "spring",
    stiffness: 300,
    damping: 30
  };

  if (hidden) {
    return (
      <motion.div
        initial={{ rotateY: 180 }}
        animate={{ rotateY: 0 }}
        transition={cardSpring}
        className="w-24 h-36 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg
                   flex items-center justify-center border-2 border-white/10"
      >
        <div className="text-4xl opacity-50">🂠</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1, rotateY: revealed ? 0 : 180 }}
      transition={cardSpring}
      className={`w-24 h-36 bg-white rounded-xl shadow-lg p-2
                 flex flex-col justify-between border-2 border-gray-200
                 ${revealed ? 'visible' : 'hidden'}`}
    >
      <div className="flex justify-between items-start">
        <div className={`text-xl font-bold ${SUIT_COLORS[card.suit]}`}>
          {card.face}
        </div>
        <div className={`text-xl ${SUIT_COLORS[card.suit]}`}>
          {SUIT_SYMBOLS[card.suit]}
        </div>
      </div>
      
      <div className={`text-4xl self-center ${SUIT_COLORS[card.suit]}`}>
        {SUIT_SYMBOLS[card.suit]}
      </div>
      
      <div className="flex justify-between items-end rotate-180">
        <div className={`text-xl font-bold ${SUIT_COLORS[card.suit]}`}>
          {card.face}
        </div>
        <div className={`text-xl ${SUIT_COLORS[card.suit]}`}>
          {SUIT_SYMBOLS[card.suit]}
        </div>
      </div>
    </motion.div>
  );
}
