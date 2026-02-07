"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
    Wifi, Zap, ChevronDown, TrendingUp, TrendingDown, Sun, Moon, Search, Star,
    BarChart3, Activity, Clock, ArrowUpRight, ArrowDownRight, Wallet, Settings,
    Bell, User, Menu, X, CircleDot, Globe, Terminal
} from "lucide-react"
import { createChart, ColorType, IChartApi, CrosshairMode, CandlestickSeries } from 'lightweight-charts'
import { useTheme } from '@/components/ThemeProvider'
import { TraderProfileCard } from '@/components/TraderProfileCard'

type Trade = { id: string; price: number; qty: number; side: "buy" | "sell"; time: string }
type OrderBookItem = { price: number; qty: number; total: number }

interface Crypto {
    symbol: string;
    name: string;
    icon: string;
    color: string;
    price: number;
    change24h: number;
    changeValue: number;
    volume24h: number;
    marketCap: number;
    rank: number;
}

const CRYPTO_ICONS: Record<string, string> = {
    BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    SOL: "https://cryptologos.cc/logos/solana-sol-logo.png",
    BNB: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
    XRP: "https://cryptologos.cc/logos/xrp-xrp-logo.png",
    ADA: "https://cryptologos.cc/logos/cardano-ada-logo.png",
    AVAX: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
    MATIC: "https://cryptologos.cc/logos/polygon-matic-logo.png",
    DOT: "https://cryptologos.cc/logos/polkadot-new-dot-logo.png",
    LINK: "https://cryptologos.cc/logos/chainlink-link-logo.png",
    UNI: "https://cryptologos.cc/logos/uniswap-uni-logo.png",
    ATOM: "https://cryptologos.cc/logos/cosmos-atom-logo.png",
};

const AVAILABLE_CRYPTOS: Crypto[] = [
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: '#F7931A', price: 88077.50, change24h: 1.78, changeValue: 1537.16, volume24h: 28500000000, marketCap: 1740000000000, rank: 1 },
    { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: '#627EEA', price: 3245.50, change24h: -1.24, changeValue: -40.72, volume24h: 15200000000, marketCap: 390000000000, rank: 2 },
    { symbol: 'SOL', name: 'Solana', icon: '◎', color: '#9945FF', price: 142.30, change24h: 5.67, changeValue: 7.63, volume24h: 3200000000, marketCap: 61000000000, rank: 5 },
    { symbol: 'BNB', name: 'BNB', icon: '🔶', color: '#F3BA2F', price: 445.20, change24h: 1.89, changeValue: 8.26, volume24h: 2100000000, marketCap: 68000000000, rank: 4 },
    { symbol: 'XRP', name: 'XRP', icon: '✕', color: '#23292F', price: 2.45, change24h: 3.21, changeValue: 0.076, volume24h: 1800000000, marketCap: 134000000000, rank: 3 },
    { symbol: 'ADA', name: 'Cardano', icon: '₳', color: '#0033AD', price: 1.12, change24h: -0.95, changeValue: -0.011, volume24h: 980000000, marketCap: 39000000000, rank: 8 },
    { symbol: 'AVAX', name: 'Avalanche', icon: '🔺', color: '#E84142', price: 78.90, change24h: 4.12, changeValue: 3.12, volume24h: 750000000, marketCap: 32000000000, rank: 9 },
    { symbol: 'MATIC', name: 'Polygon', icon: '⬡', color: '#8247E5', price: 1.89, change24h: 2.67, changeValue: 0.049, volume24h: 620000000, marketCap: 17000000000, rank: 13 },
    { symbol: 'DOT', name: 'Polkadot', icon: '●', color: '#E6007A', price: 18.45, change24h: -2.34, changeValue: -0.44, volume24h: 560000000, marketCap: 26000000000, rank: 11 },
    { symbol: 'LINK', name: 'Chainlink', icon: '⬡', color: '#2A5ADA', price: 22.15, change24h: 1.45, changeValue: 0.32, volume24h: 480000000, marketCap: 13000000000, rank: 14 },
    { symbol: 'UNI', name: 'Uniswap', icon: '🦄', color: '#FF007A', price: 12.34, change24h: 3.89, changeValue: 0.46, volume24h: 320000000, marketCap: 9300000000, rank: 18 },
    { symbol: 'ATOM', name: 'Cosmos', icon: '⚛', color: '#2E3148', price: 14.67, change24h: -1.23, changeValue: -0.18, volume24h: 290000000, marketCap: 5700000000, rank: 22 },
];

export default function TradeTerminal() {
    const { theme, toggleTheme } = useTheme()
    const [selectedCrypto, setSelectedCrypto] = useState<Crypto>(AVAILABLE_CRYPTOS[0])
    const [showCryptoSelector, setShowCryptoSelector] = useState<boolean>(false)
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [favorites, setFavorites] = useState<Set<string>>(new Set(['BTC', 'ETH', 'SOL']))
    const [activeTab, setActiveTab] = useState<'chart' | 'orderbook' | 'trades'>('chart')
    const [mounted, setMounted] = useState(false)
    const [showProfileCard, setShowProfileCard] = useState(false)

    const [currentPrice, setCurrentPrice] = useState<number>(0)
    const [lastPrice, setLastPrice] = useState<number>(0)
    const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected">("disconnected")
    const [trades, setTrades] = useState<Trade[]>([])
    const [asks, setAsks] = useState<OrderBookItem[]>([])
    const [bids, setBids] = useState<OrderBookItem[]>([])

    const [orderQty, setOrderQty] = useState<string>("")
    const [orderPrice, setOrderPrice] = useState<string>("")
    const [orderType, setOrderType] = useState<'limit' | 'market'>('limit')

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<any>(null);
    const ws = useRef<WebSocket | null>(null)

    const currentCandle = useRef<{ time: number; open: number; high: number; low: number; close: number } | null>(null);

    useEffect(() => {
        setMounted(true)
    }, [])

    const toggleFavorite = (symbol: string) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev)
            if (newFavorites.has(symbol)) {
                newFavorites.delete(symbol)
            } else {
                newFavorites.add(symbol)
            }
            return newFavorites
        })
    }

    const filteredCryptos = AVAILABLE_CRYPTOS.filter(crypto =>
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const bgColor = theme === 'dark' ? '#0d1117' : '#ffffff';
        const textColor = theme === 'dark' ? '#8b949e' : '#57606a';
        const gridColor = theme === 'dark' ? '#21262d' : '#d0d7de';

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: bgColor },
                textColor: textColor,
            },
            grid: {
                vertLines: { color: gridColor },
                horzLines: { color: gridColor },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: gridColor,
                visible: true,
            },
            timeScale: {
                borderColor: gridColor,
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#3fb950',
            downColor: '#f85149',
            borderVisible: false,
            wickUpColor: '#3fb950',
            wickDownColor: '#f85149',
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;

        const initialData = [];
        let price = selectedCrypto.price;
        let time = Math.floor(Date.now() / 1000) - 6000;

        for (let i = 0; i < 100; i++) {
            const open = price;
            const volatility = price * 0.001;
            const close = price + (Math.random() * volatility * 2 - volatility);
            const high = Math.max(open, close) + Math.random() * volatility * 0.5;
            const low = Math.min(open, close) - Math.random() * volatility * 0.5;

            initialData.push({ time: time as any, open, high, low, close });
            time += 60;
            price = close;
        }

        candleSeries.setData(initialData);

        const last = initialData[initialData.length - 1];
        currentCandle.current = { ...last, time: (last.time + 60) as any, open: last.close, high: last.close, low: last.close, close: last.close };

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [theme, selectedCrypto]);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:3000')

        ws.current.onopen = () => setConnectionStatus("connected")
        ws.current.onclose = () => setConnectionStatus("disconnected")

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                if (data.type === 'trade') {
                    const { price, qty, side, time: timeStr } = data
                    const numPrice = parseFloat(price)
                    const numQty = parseFloat(qty)

                    setLastPrice(currentPrice)
                    setCurrentPrice(numPrice)

                    const nowSeconds = Math.floor(Date.now() / 1000);
                    const candleTime = Math.floor(nowSeconds / 60) * 60;

                    if (!currentCandle.current) return;

                    if (candleTime > currentCandle.current.time) {
                        const prevClose = currentCandle.current.close;
                        currentCandle.current = {
                            time: candleTime as any,
                            open: prevClose,
                            high: Math.max(prevClose, numPrice),
                            low: Math.min(prevClose, numPrice),
                            close: numPrice
                        };
                    } else {
                        currentCandle.current.close = numPrice;
                        currentCandle.current.high = Math.max(currentCandle.current.high, numPrice);
                        currentCandle.current.low = Math.min(currentCandle.current.low, numPrice);
                    }

                    candleSeriesRef.current?.update(currentCandle.current);

                    setTrades(prev => [
                        { id: Math.random().toString(36).substr(2, 5), price: numPrice, qty: numQty, side, time: timeStr },
                        ...prev.slice(0, 24)
                    ])
                    generateOrderBook(numPrice)
                }
            } catch (e) { console.error(e) }
        }
        return () => { ws.current?.close() }
    }, [currentPrice])

    const generateOrderBook = (centerPrice: number) => {
        const newAsks = []; const newBids = []
        const spread = centerPrice * 0.0001;
        for (let i = 1; i <= 12; i++) {
            newAsks.push({ price: centerPrice + (i * spread), qty: Math.random() * 1.5, total: 0 })
            newBids.push({ price: centerPrice - (i * spread), qty: Math.random() * 1.5, total: 0 })
        }
        setAsks(newAsks.reverse())
        setBids(newBids)
    }

    const placeOrder = async (side: "buy" | "sell") => {
        if (!orderQty) return alert("Enter Quantity")
        try {
            await fetch('http://localhost:3000/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol: selectedCrypto.symbol,
                    side: side,
                    price: parseFloat(orderPrice) || currentPrice,
                    qty: parseFloat(orderQty)
                })
            })
            alert(`${side.toUpperCase()} order placed for ${selectedCrypto.symbol}!`)
        } catch (e) { alert("Gateway Error") }
    }

    const formatNumber = (num: number) => {
        if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        return `$${num.toLocaleString()}`;
    }

    const formatPrice = (price: number) => {
        if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (price >= 1) return price.toFixed(2);
        return price.toFixed(4);
    }

    const t = {
        bg: theme === 'dark' ? 'bg-[#0d1117]' : 'bg-white',
        bgSecondary: theme === 'dark' ? 'bg-[#161b22]' : 'bg-gray-50',
        bgTertiary: theme === 'dark' ? 'bg-[#21262d]' : 'bg-gray-100',
        border: theme === 'dark' ? 'border-[#30363d]' : 'border-gray-200',
        text: theme === 'dark' ? 'text-[#c9d1d9]' : 'text-gray-900',
        textSecondary: theme === 'dark' ? 'text-[#8b949e]' : 'text-gray-600',
        textMuted: theme === 'dark' ? 'text-[#6e7681]' : 'text-gray-400',
        hover: theme === 'dark' ? 'hover:bg-[#21262d]' : 'hover:bg-gray-100',
        input: theme === 'dark' ? 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9]' : 'bg-white border-gray-300 text-gray-900',
        green: 'text-[#3fb950]',
        red: 'text-[#f85149]',
    }

    if (!mounted) return null;

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-black text-white">
            {/* Top Navigation Bar */}
            <nav className="h-16 border-b border-white/10 backdrop-blur-md bg-black/90 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                        <div className="relative w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded overflow-hidden group-hover:border-[#00E5FF] transition-colors duration-150">
                            <Terminal className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-[0.3em] text-white">KAIRON</span>
                    </Link>

                    <div className="hidden md:flex gap-8 text-xs font-mono text-gray-400">
                        <Link href="/" className="hover:text-[#00E5FF] transition-colors duration-150">HOME</Link>
                        <Link href="/markets" className="hover:text-[#00E5FF] transition-colors duration-150">MARKETS</Link>
                        <Link href="/trade" className="text-[#00E5FF]">TRADE</Link>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono border uppercase tracking-widest ${connectionStatus === 'connected' ? 'border-[#00E5FF]/50 text-[#00E5FF] bg-[#00E5FF]/10' : 'border-red-500/50 text-red-500 bg-red-500/10 animate-pulse'}`}>
                        ● {connectionStatus === 'connected' ? 'SYSTEM LIVE' : 'DISCONNECTED'}
                    </div>

                    <button className="p-2 hover:bg-white/5 rounded transition-all duration-150" onClick={toggleTheme}>
                        {theme === 'dark' ? <Sun className="w-5 h-5 text-gray-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
                    </button>

                    <button className="p-2 hover:bg-white/5 rounded transition-all duration-150">
                        <Bell className="w-5 h-5 text-gray-500" />
                    </button>

                    <button className="p-2 hover:bg-white/5 rounded transition-all duration-150">
                        <Wallet className="w-5 h-5 text-gray-500" />
                    </button>

                    <button
                        onClick={() => setShowProfileCard(!showProfileCard)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-black text-sm font-bold bg-[#00E5FF] hover:shadow-[0_0_20px_rgba(0,229,255,0.6)] transition-all duration-150 cursor-pointer"
                    >
                        K
                    </button>
                </div>
            </nav>

            {/* Trader Profile Card */}
            <TraderProfileCard isOpen={showProfileCard} onClose={() => setShowProfileCard(false)} />

            {/* 1. HEADER (ASSET INFO) */}
            <div className="border-b border-white/10 px-6 py-4 shrink-0 bg-white/5">
                <div className="flex items-center justify-between">
                    {/* Left: Crypto Info */}
                    <div className="flex items-center gap-8">
                        {/* Large Ticker */}
                        <div className="relative">
                            <button
                                onClick={() => setShowCryptoSelector(!showCryptoSelector)}
                                className="flex items-center gap-4 group"
                            >
                                <div className="relative">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl font-bold grayscale-[0.3] group-hover:grayscale-0 transition-all duration-150"
                                        style={{ backgroundColor: selectedCrypto.color }}
                                    >
                                        {selectedCrypto.icon}
                                    </div>
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-4xl font-bold font-mono tracking-wider text-white">
                                            {selectedCrypto.symbol} / USD
                                        </h1>
                                        <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform duration-150 ${showCryptoSelector ? 'rotate-180' : ''}`} />
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-600 font-mono uppercase tracking-wider">PERPETUAL</span>
                                        <span className="text-gray-700">•</span>
                                        <span className="text-xs text-gray-600 font-mono">RANK #{selectedCrypto.rank}</span>
                                    </div>
                                </div>
                            </button>

                            {/* Dropdown */}
                            {showCryptoSelector && (
                                <div className="absolute top-full mt-4 left-0 w-105 border border-white/10 shadow-2xl z-50 overflow-hidden bg-black">
                                    <div className="p-4 border-b border-white/5">
                                        <div className="relative">
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[#00E5FF] font-mono text-sm">{'>'}_</div>
                                            <input
                                                type="text"
                                                placeholder="Search markets..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-8 pr-4 py-3 bg-transparent border-0 border-b border-white/10 outline-none focus:border-[#00E5FF] transition-all duration-150 text-sm font-mono text-white placeholder-gray-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-3 border-b border-white/5 bg-white/5">
                                        <div className="text-xs text-gray-600 uppercase tracking-[0.15em] font-semibold font-mono mb-2 px-2">FAVORITES</div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {AVAILABLE_CRYPTOS.filter(c => favorites.has(c.symbol)).slice(0, 6).map(crypto => (
                                                <button
                                                    key={crypto.symbol}
                                                    onClick={() => { setSelectedCrypto(crypto); setShowCryptoSelector(false); }}
                                                    className={`flex items-center gap-2 p-2 transition-all duration-150 border ${selectedCrypto.symbol === crypto.symbol ? 'border-[#00E5FF] bg-[#00E5FF]/10' : 'border-white/10 hover:bg-white/5'}`}
                                                >
                                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: crypto.color }}>
                                                        {crypto.icon}
                                                    </div>
                                                    <span className="text-sm font-medium font-mono">{crypto.symbol}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="max-h-80 overflow-y-auto">
                                        <div className="text-xs text-gray-600 uppercase tracking-[0.15em] font-semibold font-mono p-3 px-5">ALL MARKETS</div>
                                        {filteredCryptos.map(crypto => (
                                            <CryptoRow
                                                key={crypto.symbol}
                                                crypto={crypto}
                                                selected={selectedCrypto.symbol === crypto.symbol}
                                                onSelect={() => { setSelectedCrypto(crypto); setShowCryptoSelector(false); }}
                                                isFavorite={favorites.has(crypto.symbol)}
                                                onToggleFavorite={() => toggleFavorite(crypto.symbol)}
                                                theme={theme}
                                                formatPrice={formatPrice}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Main Price with Glow */}
                        <div className="pl-8 border-l border-white/10">
                            <div className="flex items-baseline gap-2">
                                <span className="text-xs text-gray-600 font-mono uppercase tracking-wider">MARK</span>
                                <span className={`text-5xl font-bold font-mono tabular-nums ${currentPrice >= lastPrice ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`} style={{ textShadow: currentPrice >= lastPrice ? '0 0 20px rgba(0,229,255,0.5)' : '0 0 20px rgba(255,0,110,0.5)' }}>
                                    ${formatPrice(currentPrice || selectedCrypto.price)}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                                <span className={`flex items-center gap-1 text-base font-bold font-mono ${selectedCrypto.change24h >= 0 ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`}>
                                    {selectedCrypto.change24h >= 0 ? '▲' : '▼'}
                                    {selectedCrypto.change24h >= 0 ? '+' : ''}{formatPrice(selectedCrypto.changeValue)}
                                </span>
                                <span className={`text-base font-bold font-mono ${selectedCrypto.change24h >= 0 ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`}>
                                    {selectedCrypto.change24h >= 0 ? '+' : ''}{selectedCrypto.change24h.toFixed(2)}%
                                </span>
                                <span className="text-xs text-gray-700 font-mono">24H</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Stats */}
                    <div className="hidden lg:flex items-center gap-8">
                        <StatBox label="24H VOL" value={formatNumber(selectedCrypto.volume24h)} />
                        <StatBox label="MKT CAP" value={formatNumber(selectedCrypto.marketCap)} />
                        <StatBox label="24H HIGH" value={`$${formatPrice(selectedCrypto.price * 1.02)}`} color="text-[#00E5FF]" />
                        <StatBox label="24H LOW" value={`$${formatPrice(selectedCrypto.price * 0.98)}`} color="text-[#FF006E]" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Chart & Order Panel */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* 2. CHART CONTAINER */}
                    <div className="flex-1 relative overflow-hidden border border-white/10 m-2">
                        {/* Chart Header */}
                        <div className="absolute top-0 left-0 right-0 z-10 px-4 py-2 border-b border-white/10 bg-black/80 backdrop-blur-sm">
                            <span className="text-xs font-mono text-gray-500 tracking-wider">// PRICE ACTION [1H]</span>
                        </div>

                        {/* Chart */}
                        <div ref={chartContainerRef} className="w-full h-full pt-10" />

                        {/* Scanline Overlay */}
                        <div className="absolute inset-0 pointer-events-none" style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)'
                        }} />
                    </div>

                    {/* 4. PLACE ORDER - Bottom Left */}
                    <div className="h-56 shrink-0 border-t border-white/10 p-5 bg-white/5">
                        <div className="h-full flex gap-8">
                            {/* Order Form */}
                            <div className="w-80 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold font-mono flex items-center gap-2 text-white uppercase tracking-wider text-sm">
                                        <Zap className="w-4 h-4 text-[#00E5FF]" />
                                        PLACE ORDER
                                    </h3>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setOrderType('limit')}
                                            className={`px-3 py-1 text-xs font-medium font-mono uppercase tracking-wider transition-all duration-150 border ${orderType === 'limit' ? 'border-[#00E5FF] text-[#00E5FF]' : 'border-white/20 text-gray-500'}`}
                                        >
                                            LIMIT
                                        </button>
                                        <button
                                            onClick={() => setOrderType('market')}
                                            className={`px-3 py-1 text-xs font-medium font-mono uppercase tracking-wider transition-all duration-150 border ${orderType === 'market' ? 'border-[#00E5FF] text-[#00E5FF]' : 'border-white/20 text-gray-500'}`}
                                        >
                                            MARKET
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {orderType === 'limit' && (
                                        <div>
                                            <label className="text-[10px] text-gray-600 mb-2 block font-mono uppercase tracking-[0.15em]">PRICE</label>
                                            <div className="relative">
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">$</span>
                                                <input
                                                    type="number"
                                                    placeholder={formatPrice(selectedCrypto.price)}
                                                    value={orderPrice}
                                                    onChange={e => setOrderPrice(e.target.value)}
                                                    className="w-full pl-4 pr-2 pb-2 bg-transparent border-0 border-b border-white/20 text-white text-base outline-none focus:border-[#00E5FF] transition-all duration-150 font-mono placeholder-gray-700"
                                                    style={{ boxShadow: 'none' }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className={orderType === 'market' ? 'col-span-2' : ''}>
                                        <label className="text-[10px] text-gray-600 mb-2 block font-mono uppercase tracking-[0.15em]">AMOUNT</label>
                                        <div className="relative">
                                            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">{selectedCrypto.symbol}</span>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={orderQty}
                                                onChange={e => setOrderQty(e.target.value)}
                                                className="w-full pl-2 pr-14 pb-2 bg-transparent border-0 border-b border-white/20 text-white text-base outline-none focus:border-[#00E5FF] transition-all duration-150 font-mono placeholder-gray-700"
                                                style={{ boxShadow: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button
                                        onClick={() => placeOrder('buy')}
                                        className="py-3 px-4 bg-[#00E5FF] text-black font-bold font-mono uppercase tracking-widest text-sm -skew-x-6 hover:shadow-[0_0_20px_rgba(0,229,255,0.6)] transition-all duration-150 active:scale-95"
                                    >
                                        <span className="skew-x-6 block">BUY</span>
                                    </button>
                                    <button
                                        onClick={() => placeOrder('sell')}
                                        className="py-3 px-4 border-2 border-[#FF006E] text-[#FF006E] hover:bg-[#FF006E] hover:text-black font-bold font-mono uppercase tracking-widest text-sm -skew-x-6 hover:shadow-[0_0_20px_rgba(255,0,110,0.6)] transition-all duration-150 active:scale-95"
                                    >
                                        <span className="skew-x-6 block">SELL</span>
                                    </button>
                                </div>
                            </div>

                            {/* 5. ACCOUNT STATS */}
                            <div className="flex-1 grid grid-cols-4 gap-6 pl-8 border-l border-white/10">
                                <PortfolioStat label="AVAILABLE BALANCE" value="$42,500.00" icon={<Wallet className="w-4 h-4" />} />
                                <PortfolioStat label="PORTFOLIO VALUE" value="$142,059.20" icon={<BarChart3 className="w-4 h-4" />} showSparkline />
                                <PortfolioStat label="UNREALIZED P&L" value="+$1,203.50" color="text-[#00E5FF]" icon={<TrendingUp className="w-4 h-4" />} />
                                <PortfolioStat label="TODAY'S P&L" value="+$458.32" color="text-[#00E5FF]" icon={<Activity className="w-4 h-4" />} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. ORDER BOOK - Right Panel */}
                <div className="w-80 shrink-0 flex flex-col border-l border-white/10 bg-black">
                    {/* Header */}
                    <div className="border-b border-white/10 px-4 py-3 bg-white/5">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-gray-500">L2 MARKET DEPTH</h3>
                    </div>

                    {/* Order Book */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="grid grid-cols-3 text-[10px] text-gray-600 px-3 py-2 border-b border-white/5 font-medium font-mono uppercase tracking-[0.15em]">
                            <span>PRICE</span>
                            <span className="text-right">SIZE</span>
                            <span className="text-right">TOTAL</span>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col justify-end px-1">
                            {asks.map((a, i) => (
                                <OrderBookRow key={i} price={a.price} qty={a.qty} type="ask" formatPrice={formatPrice} />
                            ))}
                        </div>

                        <div className="py-3 px-4 border-y border-white/10 flex items-center justify-between bg-white/5">
                            <span className={`text-xl font-bold font-mono ${currentPrice >= lastPrice ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`}>
                                ${formatPrice(currentPrice || selectedCrypto.price)}
                            </span>
                            <span className="text-xs text-gray-700 font-mono uppercase tracking-wider">
                                SPREAD
                            </span>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col justify-start px-1">
                            {bids.map((b, i) => (
                                <OrderBookRow key={i} price={b.price} qty={b.qty} type="bid" formatPrice={formatPrice} />
                            ))}
                        </div>
                    </div>

                    {/* Recent Trades */}
                    <div className="h-1/4 border-t border-white/10 flex flex-col">
                        <div className="grid grid-cols-3 text-[10px] text-gray-600 px-3 py-2 border-b border-white/5 font-medium font-mono uppercase tracking-[0.15em]">
                            <span>PRICE</span>
                            <span className="text-right">SIZE</span>
                            <span className="text-right">TIME</span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {trades.map(t => (
                                <div key={t.id} className="grid grid-cols-3 px-3 py-1 text-xs hover:bg-white/5 transition-all duration-150 font-mono">
                                    <span className={t.side === 'buy' ? 'text-[#00E5FF]' : 'text-[#FF006E]'}>
                                        {formatPrice(t.price)}
                                    </span>
                                    <span className="text-right text-gray-500">{t.qty.toFixed(4)}</span>
                                    <span className="text-right text-gray-600 text-[10px]">{t.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CryptoRow({ crypto, selected, onSelect, isFavorite, onToggleFavorite, theme, formatPrice }: {
    crypto: Crypto;
    selected: boolean;
    onSelect: () => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    theme: 'dark' | 'light';
    formatPrice: (n: number) => string;
}) {
    return (
        <div
            className={`flex items-center justify-between px-5 py-3 border-b border-white/5 transition-all duration-150 cursor-pointer group ${selected ? 'border-l-2 border-l-[#00E5FF] bg-[#00E5FF]/5' : 'hover:bg-white/5 hover:border-l-2 hover:border-l-[#00E5FF]'
                }`}
            onClick={onSelect}
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg grayscale-[0.3] group-hover:grayscale-0 transition-all duration-150" style={{ backgroundColor: crypto.color }}>
                    {crypto.icon}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-white font-mono">{crypto.symbol}</span>
                        <span className="text-xs text-gray-600 font-mono">#{crypto.rank}</span>
                    </div>
                    <span className="text-xs text-gray-500">{crypto.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <div className="font-medium text-white font-mono">${formatPrice(crypto.price)}</div>
                    <div className={`text-xs font-mono ${crypto.change24h >= 0 ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`}>
                        {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                    className={`p-1 transition-all duration-150 ${isFavorite ? 'text-[#00E5FF]' : 'text-gray-700 opacity-0 group-hover:opacity-100'}`}
                >
                    <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
            </div>
        </div>
    )
}

function OrderBookRow({ price, qty, type, formatPrice }: { price: number; qty: number; type: 'bid' | 'ask'; formatPrice: (n: number) => string }) {
    return (
        <div className="grid grid-cols-3 px-3 py-0.5 text-xs hover:bg-white/5 cursor-pointer relative transition-all duration-150">
            {/* Depth Bar - Right to Left Gradient */}
            <div
                className="absolute top-0 right-0 bottom-0 opacity-[0.15]"
                style={{
                    width: `${Math.min(qty * 30, 100)}%`,
                    background: type === 'bid'
                        ? 'linear-gradient(to left, #00E5FF, transparent)'
                        : 'linear-gradient(to left, #FF006E, transparent)'
                }}
            />
            <span className={`relative font-medium font-mono ${type === 'bid' ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`}>
                {formatPrice(price)}
            </span>
            <span className="relative text-right text-gray-400 font-mono">{qty.toFixed(4)}</span>
            <span className="relative text-right text-gray-600 font-mono">{(price * qty).toFixed(0)}</span>
        </div>
    )
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div className="text-right">
            <div className="text-[10px] text-gray-600 mb-1 font-mono uppercase tracking-[0.15em]">{label}</div>
            <div className={`text-sm font-semibold font-mono ${color || 'text-white'}`}>{value}</div>
        </div>
    )
}

function PortfolioStat({ label, value, color, icon, showSparkline }: { label: string; value: string; color?: string; icon: React.ReactNode; showSparkline?: boolean }) {
    return (
        <div>
            <div className="flex items-center gap-2 text-gray-600 mb-2">
                <div className="text-gray-500">
                    {icon}
                </div>
                <span className="text-[10px] font-medium font-mono uppercase tracking-[0.15em]">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className={`text-2xl font-bold font-mono ${color || 'text-white'}`}>{value}</div>
                {showSparkline && (
                    <svg className="w-12 h-6" viewBox="0 0 48 24" fill="none">
                        <polyline
                            points="0,18 8,12 16,16 24,8 32,10 40,4 48,6"
                            stroke="#00E5FF"
                            strokeWidth="2"
                            fill="none"
                            opacity="0.5"
                        />
                    </svg>
                )}
            </div>
        </div>
    )
}
