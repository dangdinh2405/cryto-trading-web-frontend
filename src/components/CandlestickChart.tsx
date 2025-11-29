import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

declare global {
  interface Window {
    LightweightCharts: any;
  }
}

interface CandlestickChartProps {
  symbol: string;
  timeframe: string;
}

// API Configuration
const API_BASE = "http://localhost:5001";
const WS_BASE = "ws://localhost:5001";
const INITIAL_CANDLE_LIMIT = 500;

interface BarData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

async function fetchCandles({
  symbol,
  interval,
  limit,
  endTime,
}: {
  symbol: string;
  interval: string;
  limit: number;
  endTime?: number; // unix seconds
}): Promise<BarData[]> {
  // Ensure symbol has USDT suffix for database lookup
  const dbSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;

  const params = new URLSearchParams({
    symbol: dbSymbol,
    interval,
    limit: String(limit),
  });
  if (endTime) {
    params.set("endTime", new Date(endTime * 1000).toISOString());
  }

  const res = await fetch(`${API_BASE}/market/candles?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch candles");
  const json = await res.json();

  const candles = (json.candles || [])
    .map((c: any) => {
      // Backend might use snake_case (open_time) or camelCase (openTime)
      const openTimeStr = c.open_time || c.openTime;
      const time = Math.floor(new Date(openTimeStr).getTime() / 1000);

      return {
        time,
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close),
        volume: Number(c.volume || 0),
      };
    })
    .filter((bar: BarData) => !isNaN(bar.time)) // Remove invalid times
    .sort((a: BarData, b: BarData) => a.time - b.time); // Sort ascending

  return candles;
}

export function CandlestickChart({ symbol, timeframe }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const isFetchingMoreRef = useRef(false);
  const oldestTimeRef = useRef<number | null>(null);

  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [prevPrice, setPrevPrice] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    if (typeof createChart !== 'undefined') {
      window.LightweightCharts = { createChart };
      setIsLibraryLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLibraryLoaded || !chartContainerRef.current) return;

    const chart = window.LightweightCharts.createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#0f172a' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      crosshair: { mode: 1 },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#334155',
      },
      rightPriceScale: { borderColor: '#334155' },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    chartInstance.current = chart;
    candleSeriesRef.current = candleSeries;

    (async () => {
      try {
        const history = await fetchCandles({
          symbol,
          interval: timeframe,
          limit: INITIAL_CANDLE_LIMIT,
        });

        // Data is already sorted ascending by time from fetchCandles
        candleSeries.setData(history);

        if (history.length > 0) {
          const first = history[0];
          const last = history[history.length - 1];
          oldestTimeRef.current = first.time;

          setCurrentPrice(last.close);
          setPrevPrice(last.open);
        }
      } catch (e) {
        console.error(e);
      }
    })();

    const timeScale = chart.timeScale();

    const maybeLoadMore = async () => {
      if (isFetchingMoreRef.current) return;
      if (!oldestTimeRef.current) return;

      const logicalRange = timeScale.getVisibleLogicalRange();
      if (!logicalRange) return;

      if (logicalRange.from < 10) {
        isFetchingMoreRef.current = true;
        try {
          const more = await fetchCandles({
            symbol,
            interval: timeframe,
            limit: 500,
            endTime: oldestTimeRef.current,
          });

          if (more.length > 0) {
            const currentData = candleSeries.data() as BarData[];
            const merged = [...more, ...currentData];
            candleSeries.setData(merged);

            oldestTimeRef.current = more[0].time;
          }
        } catch (e) {
          console.error("load more failed:", e);
        } finally {
          isFetchingMoreRef.current = false;
        }
      }
    };

    timeScale.subscribeVisibleLogicalRangeChange(maybeLoadMore);

    const handleResize = () => {
      if (chartInstance.current && chartContainerRef.current) {
        chartInstance.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      timeScale.unsubscribeVisibleLogicalRangeChange(maybeLoadMore);
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [isLibraryLoaded, symbol, timeframe]);

  useEffect(() => {
    if (!isLibraryLoaded) return;

    const ws = new WebSocket(`${WS_BASE}/ws/market-prices`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[CandlestickChart] connected");
      setIsConnected(true);

      // Subscribe to symbol for price updates
      ws.send(JSON.stringify({
        type: 'subscribe',
        symbols: [symbol]
      }));
    };

    ws.onclose = () => {
      console.log("[CandlestickChart] disconnected");
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.error("[CandlestickChart] error", err);
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // data is array of OHLCV candles
        if (Array.isArray(data)) {
          data.forEach(candle => {
            if (candle.symbol === symbol) {
              const bar: BarData = {
                time: Math.floor(new Date(candle.open_time).getTime() / 1000),
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: candle.volume
              };

              candleSeriesRef.current?.update(bar);

              setCurrentPrice((prev) => {
                setPrevPrice(prev);
                return bar.close;
              });
            }
          });
        }
      } catch (e) {
        console.error("[CandlestickChart] parse error:", e);
      }
    };

    return () => {
      // Unsubscribe before closing
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'unsubscribe',
          symbols: [symbol]
        }));
      }
      ws.close();
      wsRef.current = null;
    };
  }, [isLibraryLoaded, symbol]);

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
        <div className={`size-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-xs text-muted-foreground">
          {isConnected ? 'Live' : 'Disconnected'}
        </span>
      </div>

      <div className="absolute top-2 right-2 z-10 text-xs text-muted-foreground">
        {symbol} • {timeframe}
      </div>

      <div ref={chartContainerRef} className="h-full w-full" />
    </div>
  );
}
