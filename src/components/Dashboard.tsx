import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { TradingView } from './TradingView';

type View = 'trading' | 'portfolio' | 'orders' | 'watchlist' | 'profile' | 'settings' | 'admin';

export function Dashboard() {
  const [currentView, setCurrentView] = useState<View>('trading');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');

  const renderView = () => {
    switch (currentView) {
      case 'trading':
        return <TradingView selectedSymbol={selectedSymbol} onSymbolChange={setSelectedSymbol} />;
      default:
        return <TradingView selectedSymbol={selectedSymbol} onSymbolChange={setSelectedSymbol} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 overflow-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
