import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { api } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface TradingPanelProps {
  symbol: string;
  currentPrice: number;
}

export function TradingPanel({ symbol, currentPrice }: TradingPanelProps) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBalance();
  }, []);

  useEffect(() => {
    if (orderType === 'market') {
      setPrice(currentPrice.toString());
    }
  }, [currentPrice, orderType]);

  const loadBalance = async () => {
    const response = await api.getBalance();
    if (response.data) {
      setBalance(response.data);
    }
  };

  const calculateTotal = () => {
    const p = parseFloat(price) || 0;
    const a = parseFloat(amount) || 0;
    return p * a;
  };

  const calculateFee = () => {
    return calculateTotal() * 0.001; // 0.1% fee
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsLoading(true);

    const orderData = {
      symbol,
      side,
      type: orderType,
      amount: parseFloat(amount),
      ...(orderType === 'limit' && { price: parseFloat(price) }),
    };

    const response = await api.placeOrder(orderData);

    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success(`${side === 'buy' ? 'Buy' : 'Sell'} order placed successfully!`);
      setAmount('');
      if (orderType === 'limit') setPrice('');
      loadBalance();
    }

    setIsLoading(false);
  };

  const availableBalance = side === 'buy'
    ? balance?.USDT?.available || 0
    : balance?.[symbol]?.available || 0;

  const maxAmount = side === 'buy'
    ? (availableBalance / (parseFloat(price) || currentPrice)) * 0.999 // Account for fee
    : availableBalance;

  return (
    <Card className="h-full p-4">
      <Tabs value={side} onValueChange={(v) => setSide(v as 'buy' | 'sell')}>
        <TabsList className="w-full">
          <TabsTrigger value="buy" className="flex-1">Buy</TabsTrigger>
          <TabsTrigger value="sell" className="flex-1">Sell</TabsTrigger>
        </TabsList>

        <TabsContent value={side} className="space-y-4 mt-4">
          {/* Order Type */}
          <div className="flex gap-2">
            <Button
              variant={orderType === 'market' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOrderType('market')}
              className="flex-1"
            >
              Market
            </Button>
            <Button
              variant={orderType === 'limit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOrderType('limit')}
              className="flex-1"
            >
              Limit
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Price */}
            {orderType === 'limit' && (
              <div className="space-y-2">
                <Label>Price (USDT)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            )}

            {orderType === 'market' && (
              <div className="space-y-2">
                {/* <Label>Market Price</Label>
                <div className="p-2 bg-secondary rounded text-sm">
                  ${currentPrice.toLocaleString()}
                </div> */}
              </div>
            )}

            {/* Amount */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Amount ({symbol})</Label>
                <button
                  type="button"
                  onClick={() => setAmount(maxAmount.toFixed(8))}
                  className="text-xs text-primary hover:underline"
                >
                  Max: {maxAmount.toFixed(8)}
                </button>
              </div>
              <Input
                type="number"
                step="0.00000001"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* Available Balance */}
            <div className="p-3 bg-secondary rounded space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available</span>
                <span>
                  {availableBalance.toFixed(side === 'buy' ? 2 : 8)} {side === 'buy' ? 'USDT' : symbol}
                </span>
              </div>

              {amount && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span>{calculateTotal().toFixed(2)} USDT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee (0.1%)</span>
                    <span>{calculateFee().toFixed(2)} USDT</span>
                  </div>
                </>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className={`w-full ${side === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : `${side === 'buy' ? 'Buy' : 'Sell'} ${symbol}`}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
