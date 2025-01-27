'use client';
import { useState, useEffect } from 'react';
import { Card, createDeck } from '../utils/cards';
import PlayingCard from '../components/PlayingCard';

type PileType = 'foundation' | 'tableau' | 'waste' | 'stock';

interface CardWithMetadata extends Card {
  revealed: boolean;
  pileType: PileType;
  pileIndex: number;
  stackIndex: number;
}

export default function Solitaire() {
  const [mounted, setMounted] = useState(false);
  const [foundations, setFoundations] = useState<CardWithMetadata[][]>(Array(4).fill([]));
  const [tableau, setTableau] = useState<CardWithMetadata[][]>(Array(7).fill([]));
  const [stock, setStock] = useState<CardWithMetadata[]>([]);
  const [waste, setWaste] = useState<CardWithMetadata[]>([]);
  const [] = useState<CardWithMetadata | null>(null);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    setMounted(true);
    initializeGame();
  }, []);

  if (!mounted) return null;

  function initializeGame() {
    const deck = createDeck().map((card, i) => ({
      ...card,
      revealed: false,
      pileType: 'stock' as PileType,
      pileIndex: 0,
      stackIndex: i
    }));

    // Initialize tableau
    const newTableau: CardWithMetadata[][] = Array(7).fill([]).map(() => []);
    for (let i = 0; i < 7; i++) {
      for (let j = i; j < 7; j++) {
        const card = deck.pop()!;
        card.pileType = 'tableau';
        card.pileIndex = j;
        card.stackIndex = i;
        card.revealed = i === j;
        newTableau[j].push(card);
      }
    }

    setTableau(newTableau);
    setStock(deck);
    setWaste([]);
    setFoundations(Array(4).fill([]));
    setMoves(0);
  }



  // Add move validation and card movement logic...

  return (
    <div className="pt-20 p-8 min-h-screen bg-gradient-to-b from-green-900 to-green-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Solitaire</h2>
          <div className="flex gap-4">
            <p className="text-white">Moves: {moves}</p>
            <button
              onClick={initializeGame}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              New Game
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {/* Stock pile */}
          <div className="col-span-1">
            <div 
              className="bg-green-800/50 p-4 rounded-xl min-h-[144px] backdrop-blur-sm"
              onClick={() => {/* Handle stock click */}}
            >
              {stock.length > 0 && (
                <PlayingCard card={stock[stock.length - 1]} hidden />
              )}
            </div>
          </div>

          {/* Waste pile */}
          <div className="col-span-1">
            <div className="bg-green-800/50 p-4 rounded-xl min-h-[144px] backdrop-blur-sm">
              {waste.length > 0 && (
                <PlayingCard card={waste[waste.length - 1]} />
              )}
            </div>
          </div>

          {/* Foundation piles */}
          {foundations.map((pile, i) => (
            <div key={`foundation-${i}`} className="col-span-1">
              <div className="bg-green-800/50 p-4 rounded-xl min-h-[144px] backdrop-blur-sm">
                {pile.length > 0 && (
                  <PlayingCard card={pile[pile.length - 1]} />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tableau */}
        <div className="grid grid-cols-7 gap-4 mt-8">
          {tableau.map((pile, i) => (
            <div key={`tableau-${i}`} className="col-span-1">
              <div className="bg-green-800/50 p-4 rounded-xl min-h-[144px] backdrop-blur-sm">
                <div className="relative">
                  {pile.map((card, j) => (
                    <div
                      key={`${i}-${j}`}
                      className="absolute"
                      style={{ top: `${j * 30}px` }}
                    >
                      <PlayingCard card={card} revealed={card.revealed} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
