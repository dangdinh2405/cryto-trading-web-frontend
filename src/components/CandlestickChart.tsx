import React, { useState, useEffect } from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';
import { api } from '../utils/api';

interface CandlestickChartProps {
  symbol: string;
  timeframe: string;
}

export function CandlestickChart({ symbol, timeframe }: CandlestickChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandles();
  }, [symbol, timeframe]);

  const loadCandles = async () => {
    setLoading(true);
    const response = await api.getCandles(symbol, timeframe, 100);
    if (response.data) {
      setData(response.data);
    }
    setLoading(false);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center">Loading chart...</div>;
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            domain={['auto', 'auto']}
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
            labelFormatter={(label) => new Date(label).toLocaleString()}
            formatter={(value: any) => ['$' + value.toFixed(2), '']}
          />
          
          {/* Candlestick body */}
          <Bar
            dataKey={(entry) => [entry.open, entry.close]}
            fill={(entry) => entry.close >= entry.open ? '#22c55e' : '#ef4444'}
            minPointSize={2}
          />
          
          {/* High-Low wicks */}
          <Line
            type="linear"
            dataKey="high"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            dot={false}
          />
          <Line
            type="linear"
            dataKey="low"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
