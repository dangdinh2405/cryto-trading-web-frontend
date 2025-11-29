import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useMarketPrices } from '../hooks/useMarketPrices';

interface MarketSelectorProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

export function MarketSelector({ selectedSymbol, onSymbolChange }: MarketSelectorProps) {
  const { prices } = useMarketPrices();
  const markets = ['BTC', 'ETH', 'SOL', 'BNB'];

  // Subscribe to all markets for price display
  useEffect(() => {
    // Prices are automatically subscribed via TradingView
  }, []);

  return (
    <Select value={selectedSymbol} onValueChange={onSymbolChange}>
      <SelectTrigger className="w-48">
        <SelectValue>{selectedSymbol}/USDT</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {markets.map((symbol) => {
          const marketPrice = prices[symbol];
          const price = marketPrice?.close || 0;
          const change = marketPrice
            ? ((marketPrice.close - marketPrice.open) / marketPrice.open) * 100
            : 0;
          const isPositive = change >= 0;

          return (
            <SelectItem key={symbol} value={symbol}>
              <div className="flex items-center justify-between gap-4">
                <span>{symbol}/USDT</span>
                <div className="flex items-center gap-2 text-xs">
                  <span>${price.toLocaleString()}</span>
                  <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                    {isPositive ? '+' : ''}{change.toFixed(2)}%
                  </span>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
