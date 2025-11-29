import { useEffect, useRef, useState, useCallback } from 'react';

interface OrderBookEntry {
    price: number;
    amount: number;
}

interface OrderBook {
    market_id: string;
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
    timestamp: string;
}

interface UseOrderbookReturn {
    orderbooks: Record<string, OrderBook>;
    isConnected: boolean;
    subscribe: (marketIds: string[]) => void;
    unsubscribe: (marketIds: string[]) => void;
}

const WS_URL = 'ws://localhost:5001/ws/orderbook';
const RECONNECT_DELAY = 3000;

export function useOrderbook(): UseOrderbookReturn {
    const [orderbooks, setOrderbooks] = useState<Record<string, OrderBook>>({});
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const subscribedMarketIds = useRef<Set<string>>(new Set());
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    const sendMessage = useCallback((type: string, market_ids: string[]) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type, market_ids }));
        }
    }, []);

    const subscribe = useCallback((marketIds: string[]) => {
        marketIds.forEach(id => subscribedMarketIds.current.add(id));
        sendMessage('subscribe', marketIds);
    }, [sendMessage]);

    const unsubscribe = useCallback((marketIds: string[]) => {
        marketIds.forEach(id => subscribedMarketIds.current.delete(id));
        sendMessage('unsubscribe', marketIds);
    }, [sendMessage]);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('[useOrderbook] Connected');
            setIsConnected(true);

            // Re-subscribe to previously subscribed market IDs
            if (subscribedMarketIds.current.size > 0) {
                const marketIds = Array.from(subscribedMarketIds.current);
                sendMessage('subscribe', marketIds);
            }
        };

        ws.onclose = () => {
            console.log('[useOrderbook] Disconnected');
            setIsConnected(false);

            // Auto-reconnect after delay
            reconnectTimeoutRef.current = setTimeout(() => {
                console.log('[useOrderbook] Reconnecting...');
                connect();
            }, RECONNECT_DELAY);
        };

        ws.onerror = (error) => {
            console.error('[useOrderbook] Error:', error);
            setIsConnected(false);
        };

        ws.onmessage = (event) => {
            try {
                const data: Record<string, OrderBook> = JSON.parse(event.data);

                setOrderbooks(prevOrderbooks => ({
                    ...prevOrderbooks,
                    ...data,
                }));
            } catch (error) {
                console.error('[useOrderbook] Parse error:', error);
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
        orderbooks,
        isConnected,
        subscribe,
        unsubscribe,
    };
}
