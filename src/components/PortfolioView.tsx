import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { api } from '../utils/api';
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export function PortfolioView() {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [portfolioRes, balanceRes] = await Promise.all([
      api.getPortfolio(),
      api.getBalance(),
    ]);

    if (portfolioRes.data) setPortfolio(portfolioRes.data);
    if (balanceRes.data) setBalance(balanceRes.data);
    setLoading(false);
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center">Loading portfolio...</div>;
  }

  return (
    <div className="h-full p-6 space-y-6 overflow-auto">
      <h2 className="text-2xl">Portfolio</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Total Value</CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${portfolio?.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All assets in USDT</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Available Balance</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">${balance?.USDT?.available.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">USDT available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Realized P&L</CardTitle>
            {portfolio?.realizedPnL >= 0 ? (
              <TrendingUp className="size-4 text-green-500" />
            ) : (
              <TrendingDown className="size-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl ${portfolio?.realizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${portfolio?.realizedPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Closed positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Unrealized P&L</CardTitle>
            {portfolio?.unrealizedPnL >= 0 ? (
              <TrendingUp className="size-4 text-green-500" />
            ) : (
              <TrendingDown className="size-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl ${portfolio?.unrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${portfolio?.unrealizedPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Open positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolio?.coins?.length > 0 ? (
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2">Asset</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 text-right">Avg Buy Price</th>
                    <th className="pb-2 text-right">Current Price</th>
                    <th className="pb-2 text-right">Value (USDT)</th>
                    <th className="pb-2 text-right">P&L</th>
                    <th className="pb-2 text-right">P&L %</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.coins.map((coin: any) => {
                    const value = coin.amount * coin.currentPrice;
                    const pnl = coin.unrealizedPnL || 0;
                    const pnlPercent = ((coin.currentPrice - coin.averageBuyPrice) / coin.averageBuyPrice) * 100;
                    const isPositive = pnl >= 0;

                    return (
                      <tr key={coin.symbol} className="border-b">
                        <td className="py-3">{coin.symbol}</td>
                        <td className="text-right">{coin.amount.toFixed(8)}</td>
                        <td className="text-right">${coin.averageBuyPrice.toFixed(2)}</td>
                        <td className="text-right">${coin.currentPrice.toFixed(2)}</td>
                        <td className="text-right">${value.toFixed(2)}</td>
                        <td className={`text-right ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                          {isPositive ? '+' : ''}${pnl.toFixed(2)}
                        </td>
                        <td className={`text-right ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                          {isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No holdings yet. Start trading to build your portfolio!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cash Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2">Asset</th>
                  <th className="pb-2 text-right">Available</th>
                  <th className="pb-2 text-right">In Orders</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {balance && Object.keys(balance).map((asset) => (
                  <tr key={asset} className="border-b">
                    <td className="py-3">{asset}</td>
                    <td className="text-right">{balance[asset].available.toFixed(asset === 'USDT' ? 2 : 8)}</td>
                    <td className="text-right">{balance[asset].inOrders.toFixed(asset === 'USDT' ? 2 : 8)}</td>
                    <td className="text-right">
                      {(balance[asset].available + balance[asset].inOrders).toFixed(asset === 'USDT' ? 2 : 8)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
