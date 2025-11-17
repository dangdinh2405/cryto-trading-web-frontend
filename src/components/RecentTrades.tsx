import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

interface RecentTradesProps {
  symbol: string;
}

export function RecentTrades({ symbol }: RecentTradesProps) {
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    loadTrades();
    const interval = setInterval(loadTrades, 3000);
    return () => clearInterval(interval);
  }, [symbol]);

  const loadTrades = async () => {
    const response = await api.getRecentTrades(symbol);
    if (response.data) {
      setTrades(response.data);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="h-full overflow-auto">
      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <span>Time</span>
        <span>Price (USDT)</span>
        <span>Amount ({symbol})</span>
        <span>Side</span>
      </div>
      <div className="space-y-1">
        {trades.map((trade, index) => (
          <div key={trade.id || index} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{formatTime(trade.timestamp)}</span>
            <span className={trade.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
              {trade.price.toFixed(2)}
            </span>
            <span>{trade.amount.toFixed(4)}</span>
            <span className={trade.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
              {trade.side.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
