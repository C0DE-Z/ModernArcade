import GameTabs from './components/GameTabs';
import Link from 'next/link';

export default function Home() {
  const games = [
    {
      id: 'minesweeper',
      name: 'Minesweeper',
      description: 'Classic puzzle game with modern graphics',
      path: '/minesweeper',
      icon: '💣',
      ready: true
    },
    {
      id: '2048',
      name: '2048',
      description: 'Slide tiles and reach 2048!',
      path: '/2048',
      icon: '🎮',
      ready: true
    },
    {
      id: 'blackjack',
      name: 'Blackjack',
      description: 'Classic casino card game',
      path: '/blackjack',
      icon: '🎴',
      ready: true
    },
    {
      id: 'solitaire',
      name: 'Solitaire',
      description: 'Classic card game of patience',
      path: '/solitaire',
      icon: '🎴',
      ready: false
    },
    {
      id: 'poker',
      name: 'Poker',
      description: 'Five Card Draw Poker',
      path: '/poker',
      icon: '🃏',
      ready: false
    },
    // Add more games here
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <GameTabs />
      <main className="pt-20 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Welcome to Modern Arcade
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <div key={game.id} className="relative">
                <Link
                  href={game.ready ? game.path : '#'}
                  className={`block p-6 bg-gray-800 rounded-lg transition-colors ${
                    game.ready ? 'hover:bg-gray-700' : 'cursor-not-allowed opacity-80'
                  }`}
                >
                  <div className="text-4xl mb-4">{game.icon}</div>
                  <h2 className="text-xl font-bold text-white mb-2">{game.name}</h2>
                  <p className="text-gray-400">{game.description}</p>
                </Link>
                {!game.ready && (
                  <div className="absolute -rotate-12 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                                 bg-yellow-500 text-black font-bold py-2 px-8 rounded-lg shadow-lg 
                                 border-2 border-yellow-600">
                    WORK IN PROGRESS
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
