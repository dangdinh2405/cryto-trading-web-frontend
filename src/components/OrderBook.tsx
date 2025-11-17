import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

interface OrderBookProps {
  symbol: string;
}

export function OrderBook({ symbol }: OrderBookProps) {
  const [orderBook, setOrderBook] = useState<any>({ bids: [], asks: [] });

  useEffect(() => {
    loadOrderBook();
    const interval = setInterval(loadOrderBook, 3000);
    return () => clearInterval(interval);
  }, [symbol]);

  const loadOrderBook = async () => {
    const response = await api.getOrderBook(symbol);
    if (response.data) {
      setOrderBook(response.data);
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="grid grid-cols-2 gap-4">
        {/* Bids (Buy Orders) */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Price (USDT)</span>
            <span>Amount ({symbol})</span>
            <span>Total</span>
          </div>
          <div className="space-y-1">
            {orderBook.bids.slice(0, 10).map((bid: any, index: number) => (
              <div
                key={index}
                className="flex justify-between text-sm relative"
                style={{
                  background: `linear-gradient(to left, rgba(34, 197, 94, 0.1) ${(bid.total / orderBook.bids[9]?.total) * 100}%, transparent 0%)`,
                }}
              >
                <span className="text-green-500">{bid.price.toFixed(2)}</span>
                <span>{bid.amount.toFixed(4)}</span>
                <span className="text-muted-foreground">{bid.total.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asks (Sell Orders) */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Price (USDT)</span>
            <span>Amount ({symbol})</span>
            <span>Total</span>
          </div>
          <div className="space-y-1">
            {orderBook.asks.slice(0, 10).map((ask: any, index: number) => (
              <div
                key={index}
                className="flex justify-between text-sm relative"
                style={{
                  background: `linear-gradient(to left, rgba(239, 68, 68, 0.1) ${(ask.total / orderBook.asks[9]?.total) * 100}%, transparent 0%)`,
                }}
              >
                <span className="text-red-500">{ask.price.toFixed(2)}</span>
                <span>{ask.amount.toFixed(4)}</span>
                <span className="text-muted-foreground">{ask.total.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
