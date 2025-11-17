import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { api } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { Plus, Star, X, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface WatchlistViewProps {
  onSelectSymbol: (symbol: string) => void;
}

export function WatchlistView({ onSelectSymbol }: WatchlistViewProps) {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [prices, setPrices] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [addingSymbol, setAddingSymbol] = useState('');

  const availableCoins = ['BTC', 'ETH', 'SOL', 'BNB'];

  useEffect(() => {
    loadWatchlist();
    loadPrices();
    
    const interval = setInterval(loadPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadWatchlist = async () => {
    setLoading(true);
    const response = await api.getWatchlist();
    if (response.data) {
      setWatchlist(response.data);
    }
    setLoading(false);
  };

  const loadPrices = async () => {
    const response = await api.getMarketPrices();
    if (response.data) {
      setPrices(response.data);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!addingSymbol) return;

    const response = await api.addToWatchlist(addingSymbol);
    
    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success(`${addingSymbol} added to watchlist`);
      loadWatchlist();
      setAddingSymbol('');
    }
  };

  const handleRemoveFromWatchlist = async (symbol: string) => {
    const response = await api.removeFromWatchlist(symbol);
    
    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success(`${symbol} removed from watchlist`);
      loadWatchlist();
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center">Loading watchlist...</div>;
  }

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl">Watchlist</h2>

        <div className="flex gap-2">
          <Select value={addingSymbol} onValueChange={setAddingSymbol}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select coin" />
            </SelectTrigger>
            <SelectContent>
              {availableCoins.filter(c => !watchlist.includes(c)).map((coin) => (
                <SelectItem key={coin} value={coin}>
                  {coin}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddToWatchlist} disabled={!addingSymbol}>
            <Plus className="size-4 mr-2" />
            Add to Watchlist
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchlist.length > 0 ? (
          watchlist.map((symbol) => {
            const data = prices[symbol] || {};
            const change = data.change24h || 0;
            const isPositive = change >= 0;

            return (
              <Card key={symbol} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 size-8"
                  onClick={() => handleRemoveFromWatchlist(symbol)}
                >
                  <X className="size-4" />
                </Button>

                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="size-5 fill-yellow-500 text-yellow-500" />
                    {symbol}/USDT
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="text-3xl">${data.price?.toLocaleString()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">24h Change</p>
                      <p className={`text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{change.toFixed(2)}%
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">24h Volume</p>
                      <p className="text-lg">${(data.volume24h / 1000000).toFixed(2)}M</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">24h High</p>
                      <p>${data.high24h?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">24h Low</p>
                      <p>${data.low24h?.toLocaleString()}</p>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => onSelectSymbol(symbol)}
                  >
                    <TrendingUp className="size-4 mr-2" />
                    Trade {symbol}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Star className="size-12 mx-auto mb-4 opacity-20" />
            <p>No coins in your watchlist yet</p>
            <p className="text-sm">Add coins to track their prices</p>
          </div>
        )}
      </div>
    </div>
  );
}
