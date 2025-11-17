import React, { useState, useEffect } from 'react';
import { CandlestickChart } from './CandlestickChart';
import { OrderBook } from './OrderBook';
import { RecentTrades } from './RecentTrades';
import { TradingPanel } from './TradingPanel';
import { MarketSelector } from './MarketSelector';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { api } from '../utils/api';

interface TradingViewProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

export function TradingView({ selectedSymbol, onSymbolChange }: TradingViewProps) {
  const [prices, setPrices] = useState<any>({});
  const [timeframe, setTimeframe] = useState('1h');

  useEffect(() => {
    loadPrices();
    const interval = setInterval(loadPrices, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadPrices = async () => {
    const response = await api.getMarketPrices();
    if (response.data) {
      setPrices(response.data);
    }
  };

  const currentPrice = prices[selectedSymbol]?.price || 0;
  const change24h = prices[selectedSymbol]?.change24h || 0;
  const isPositive = change24h >= 0;

  return (
    <div className="h-full p-6 space-y-6">
      {/* Market Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <MarketSelector selectedSymbol={selectedSymbol} onSymbolChange={onSymbolChange} />
          
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-2xl">${currentPrice.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">24h Change</p>
              <p className={`text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{change24h.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">24h High</p>
              <p>${prices[selectedSymbol]?.high24h.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">24h Low</p>
              <p>${prices[selectedSymbol]?.low24h.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">24h Volume</p>
              <p>${(prices[selectedSymbol]?.volume24h / 1000000).toFixed(2)}M</p>
            </div>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex gap-2">
          {['1m', '5m', '15m', '1h', '4h', '1D'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded text-sm ${
                timeframe === tf
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Trading Grid */}
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-220px)]">
        {/* Chart Section */}
        <div className="col-span-9 space-y-4">
          <Card className="h-[70%] p-4">
            <CandlestickChart symbol={selectedSymbol} timeframe={timeframe} />
          </Card>
          
          <Card className="h-[28%] p-4">
            <Tabs defaultValue="orderbook">
              <TabsList>
                <TabsTrigger value="orderbook">Order Book</TabsTrigger>
                <TabsTrigger value="trades">Recent Trades</TabsTrigger>
              </TabsList>
              <TabsContent value="orderbook" className="h-full">
                <OrderBook symbol={selectedSymbol} />
              </TabsContent>
              <TabsContent value="trades" className="h-full">
                <RecentTrades symbol={selectedSymbol} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Trading Panel */}
        <div className="col-span-3">
          <TradingPanel symbol={selectedSymbol} currentPrice={currentPrice} />
        </div>
      </div>
    </div>
  );
}
