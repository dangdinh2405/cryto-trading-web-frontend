import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { api } from '../utils/api';

interface MarketSelectorProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

export function MarketSelector({ selectedSymbol, onSymbolChange }: MarketSelectorProps) {
  const [prices, setPrices] = useState<any>({});

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    const response = await api.getMarketPrices();
    if (response.data) {
      setPrices(response.data);
    }
  };

  const markets = ['BTC', 'ETH', 'SOL', 'BNB'];

  return (
    <Select value={selectedSymbol} onValueChange={onSymbolChange}>
      <SelectTrigger className="w-48">
        <SelectValue>{selectedSymbol}/USDT</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {markets.map((symbol) => {
          const price = prices[symbol]?.price || 0;
          const change = prices[symbol]?.change24h || 0;
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
