import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../utils/api';

interface Market {
    id: string;
    symbol: string;
    base_asset_id: string;
    quote_asset_id: string;
}

interface MarketContextValue {
    markets: Market[];
    isLoading: boolean;
    getMarketIdBySymbol: (symbol: string) => string | undefined;
    getMarketBySymbol: (symbol: string) => Market | undefined;
}

const MarketContext = createContext<MarketContextValue | undefined>(undefined);

export function MarketProvider({ children }: { children: ReactNode }) {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadMarkets();
    }, []);

    const loadMarkets = async () => {
        setIsLoading(true);
        try {
            const response = await api.getMarkets();
            if (response.data) {
                setMarkets(response.data);
            }
        } catch (error) {
            console.error('[MarketContext] Failed to load markets:', error);
        }
        setIsLoading(false);
    };

    const getMarketIdBySymbol = (symbol: string): string | undefined => {
        // Try exact match first
        let market = markets.find(m => m.symbol === symbol);

        // If not found and symbol doesn't end with USDT, try adding USDT
        if (!market && !symbol.includes('USDT')) {
            market = markets.find(m => m.symbol === `${symbol}USDT`);
        }

        // If still not found and symbol ends with USDT, try removing it
        if (!market && symbol.endsWith('USDT')) {
            const baseSymbol = symbol.replace('USDT', '');
            market = markets.find(m => m.symbol === baseSymbol);
        }

        return market?.id;
    };

    const getMarketBySymbol = (symbol: string): Market | undefined => {
        // Try exact match first
        let market = markets.find(m => m.symbol === symbol);

        // If not found and symbol doesn't end with USDT, try adding USDT
        if (!market && !symbol.includes('USDT')) {
            market = markets.find(m => m.symbol === `${symbol}USDT`);
        }

        // If still not found and symbol ends with USDT, try removing it
        if (!market && symbol.endsWith('USDT')) {
            const baseSymbol = symbol.replace('USDT', '');
            market = markets.find(m => m.symbol === baseSymbol);
        }

        return market;
    };

    return (
        <MarketContext.Provider
            value={{
                markets,
                isLoading,
                getMarketIdBySymbol,
                getMarketBySymbol,
            }}
        >
            {children}
        </MarketContext.Provider>
    );
}

export function useMarkets() {
    const context = useContext(MarketContext);
    if (!context) {
        throw new Error('useMarkets must be used within MarketProvider');
    }
    return context;
}
