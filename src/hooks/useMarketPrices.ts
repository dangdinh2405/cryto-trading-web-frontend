import { useEffect, useRef, useState, useCallback } from 'react';

interface MarketPrice {
    symbol: string;
    open_time: string;
    close_time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface UseMarketPricesReturn {
    prices: Record<string, MarketPrice>;
    isConnected: boolean;
    subscribe: (symbols: string[]) => void;
    unsubscribe: (symbols: string[]) => void;
}

const WS_URL = 'ws://localhost:5001/ws/market-prices';
const RECONNECT_DELAY = 3000;

export function useMarketPrices(): UseMarketPricesReturn {
    const [prices, setPrices] = useState<Record<string, MarketPrice>>({});
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const subscribedSymbols = useRef<Set<string>>(new Set());
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    const sendMessage = useCallback((type: string, symbols: string[]) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type, symbols }));
        }
    }, []);

    const subscribe = useCallback((symbols: string[]) => {
        symbols.forEach(symbol => subscribedSymbols.current.add(symbol));
        sendMessage('subscribe', symbols);
    }, [sendMessage]);

    const unsubscribe = useCallback((symbols: string[]) => {
        symbols.forEach(symbol => subscribedSymbols.current.delete(symbol));
        sendMessage('unsubscribe', symbols);
    }, [sendMessage]);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('[useMarketPrices] Connected');
            setIsConnected(true);

            // Re-subscribe to previously subscribed symbols
            if (subscribedSymbols.current.size > 0) {
                const symbols = Array.from(subscribedSymbols.current);
                sendMessage('subscribe', symbols);
            }
        };

        ws.onclose = () => {
            console.log('[useMarketPrices] Disconnected');
            setIsConnected(false);

            // Auto-reconnect after delay
            reconnectTimeoutRef.current = setTimeout(() => {
                console.log('[useMarketPrices] Reconnecting...');
                connect();
            }, RECONNECT_DELAY);
        };

        ws.onerror = (error) => {
            console.error('[useMarketPrices] Error:', error);
            setIsConnected(false);
        };

        ws.onmessage = (event) => {
            try {
                const data: MarketPrice[] = JSON.parse(event.data);

                setPrices(prevPrices => {
                    const newPrices = { ...prevPrices };
                    data.forEach(price => {
                        newPrices[price.symbol] = price;
                    });
                    return newPrices;
                });
            } catch (error) {
                console.error('[useMarketPrices] Parse error:', error);
            }
        };
    }, [sendMessage]);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connect]);

    return {
        prices,
        isConnected,
        subscribe,
        unsubscribe,
    };
}
