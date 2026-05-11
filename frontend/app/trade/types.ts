export type Trade = { id: string; price: number; qty: number; side: "buy" | "sell"; time: string }
export type OrderBookItem = { price: number; qty: number; total: number }

export interface Crypto {
    symbol: string;
    name: string;
    icon: string;
    color: string;
    price: number | null;
    change24h: number;
    changeValue: number;
    volume24h: number;
    marketCap: number;
    rank: number;
}

export const AVAILABLE_CRYPTOS: Crypto[] = [
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: '#F7931A', price: null, change24h: 0, changeValue: 0, volume24h: 0, marketCap: 0, rank: 1 },
    { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: '#627EEA', price: null, change24h: 0, changeValue: 0, volume24h: 0, marketCap: 0, rank: 2 },
    { symbol: 'BNB', name: 'BNB', icon: '🔶', color: '#F3BA2F', price: null, change24h: 0, changeValue: 0, volume24h: 0, marketCap: 0, rank: 3 },
    { symbol: 'SOL', name: 'Solana', icon: '◎', color: '#9945FF', price: null, change24h: 0, changeValue: 0, volume24h: 0, marketCap: 0, rank: 4 },
    { symbol: 'DOGE', name: 'Dogecoin', icon: 'Ð', color: '#C2A633', price: null, change24h: 0, changeValue: 0, volume24h: 0, marketCap: 0, rank: 5 },
    { symbol: 'LINK', name: 'Chainlink', icon: '⬡', color: '#2A5ADA', price: null, change24h: 0, changeValue: 0, volume24h: 0, marketCap: 0, rank: 6 },
    { symbol: 'XRP', name: 'XRP', icon: '✕', color: '#23292F', price: null, change24h: 0, changeValue: 0, volume24h: 0, marketCap: 0, rank: 7 },
    { symbol: 'LTC', name: 'Litecoin', icon: 'Ł', color: '#345D9D', price: null, change24h: 0, changeValue: 0, volume24h: 0, marketCap: 0, rank: 8 },
];
