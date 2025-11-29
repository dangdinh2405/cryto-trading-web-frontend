import React, { useState, useEffect } from 'react';
// import { useAuth } from './AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { TradingView } from './TradingView';
// import { PortfolioView } from './PortfolioView';
// import { OrdersView } from './OrdersView';
// import { WatchlistView } from './WatchlistView';
// import { ProfileView } from './ProfileView';
// import { SettingsView } from './SettingsView';
// import { AdminPanel } from './AdminPanel';

type View = 'trading' | 'portfolio' | 'orders' | 'watchlist' | 'profile' | 'settings' | 'admin';

export function Dashboard() {
  const [currentView, setCurrentView] = useState<View>('trading');
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');

  const renderView = () => {
    switch (currentView) {
      case 'trading':
        return <TradingView selectedSymbol={selectedSymbol} onSymbolChange={setSelectedSymbol} />;
      // case 'portfolio':
      //   return <PortfolioView />;
      // case 'orders':
      //   return <OrdersView />;
      // case 'watchlist':
      //   return <WatchlistView onSelectSymbol={(symbol) => {
      //     setSelectedSymbol(symbol);
      //     setCurrentView('trading');
      //   }} />;
      // case 'profile':
      //   return <ProfileView />;
      // case 'settings':
      //   return <SettingsView />;
      // case 'admin':
      //   return <AdminPanel />;
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
