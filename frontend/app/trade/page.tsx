"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from '@/components/ThemeProvider'
import { TraderProfileCard } from '@/components/TraderProfileCard'
import { useAuth } from "@/context/AuthContext"
import { Crypto, Trade, OrderBookItem, AVAILABLE_CRYPTOS } from './types'
import { CryptoRow } from './components/CryptoRow'
import { StatBox, PortfolioStat, OrderBookRow } from './components/UIComponents'
import { formatNumber, formatPrice, formatDisplayPrice, normalizeHistoryCandles, normalizeSymbol, toPositiveNumber } from './utils'
import { ChevronDown, Zap, Wallet, BarChart3, TrendingUp, Activity, Star, Maximize } from 'lucide-react'
import { createChart, ColorType, CrosshairMode, CandlestickSeries } from 'lightweight-charts'
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts'

type OrderRow = {
    id: string
    timestamp: string | number | Date
    side: string
    price: number
    quantity: number
    filled: number
}

export default function TradeTerminal() {
    const { theme } = useTheme()
    const router = useRouter()
    const [selectedCrypto, setSelectedCrypto] = useState<Crypto>(AVAILABLE_CRYPTOS[0])
    const [showCryptoSelector, setShowCryptoSelector] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [favorites, setFavorites] = useState(new Set(['BTC', 'ETH', 'SOL']))
    const [mounted, setMounted] = useState(false)
    const [showProfileCard, setShowProfileCard] = useState(false)
    const { user, logout } = useAuth()

    // WebSocket state
    const [currentPrice, setCurrentPrice] = useState<number | null>(null)
    const [lastPrice, setLastPrice] = useState<number | null>(null)
    const [high24h, setHigh24h] = useState<number | null>(null)
    const [low24h, setLow24h] = useState<number | null>(null)
    const [trades, setTrades] = useState<Trade[]>([])
    const [asks, setAsks] = useState<OrderBookItem[]>([])
    const [bids, setBids] = useState<OrderBookItem[]>([])

    // Order form state
    const [orderQty, setOrderQty] = useState("")
    const [orderPrice, setOrderPrice] = useState("")
    const [orderType, setOrderType] = useState<'limit' | 'market'>('limit')

    // Orders tab state
    const [ordersTab, setOrdersTab] = useState<'OPEN' | 'HISTORY'>('OPEN')
    const [openOrders, setOpenOrders] = useState<OrderRow[]>([])
    const [orderHistory, setOrderHistory] = useState<OrderRow[]>([])
    const [loadingOrders, setLoadingOrders] = useState(true)

    // Chart & WebSocket refs
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const ws = useRef<WebSocket | null>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
    const currentPriceRef = useRef<number | null>(null)
    const currentCandle = useRef<{ time: Time; open: number; high: number; low: number; close: number } | null>(null)
    const activeSymbolRef = useRef<string>(normalizeSymbol(selectedCrypto.symbol))
    const wsSessionRef = useRef(0)
    const chartSessionRef = useRef(0)
    const [chartPayloadInfo, setChartPayloadInfo] = useState<{ count: number; first?: number; last?: number } | null>(null)

    useEffect(() => setMounted(true), [])

    const handleAuthGate = () => {
        router.push('/auth/login?next=/trade')
    }

    // Save last visited symbol
    useEffect(() => {
        if (selectedCrypto) {
            localStorage.setItem('last_trade_symbol', selectedCrypto.symbol + 'USDT')
        }
    }, [selectedCrypto])

    const toggleFavorite = (symbol: string) => {
        setFavorites(prev => {
            const newFav = new Set(prev)
            if (newFav.has(symbol)) {
                newFav.delete(symbol)
            } else {
                newFav.add(symbol)
            }
            return newFav
        })
    }

    const filteredCryptos = AVAILABLE_CRYPTOS.filter(crypto =>
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // WebSocket & chart setup
    useEffect(() => {
        if (!mounted || !chartContainerRef.current) return

        const bgColor = '#080E14'
        const textColor = '#8D8F98'
        const gridColor = '#1A1D2A'

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            layout: {
                background: { type: ColorType.Solid, color: bgColor },
                textColor: textColor,
            },
            grid: {
                vertLines: { color: gridColor },
                horzLines: { color: gridColor },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: gridColor,
            },
            rightPriceScale: {
                borderColor: gridColor,
                visible: true,
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: { color: 'rgba(0, 229, 255, 0.3)', width: 1, style: 3 },
                horzLine: { color: 'rgba(0, 229, 255, 0.3)', width: 1, style: 3 },
            },
        })

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#00E5FF',
            downColor: '#FF007A',
            borderVisible: false,
            wickUpColor: '#00E5FF',
            wickDownColor: '#FF007A',
        })

        chartRef.current = chart
        candleSeriesRef.current = candleSeries
        const sessionId = ++chartSessionRef.current
        const controller = new AbortController()
        let destroyed = false

        const loadChartData = async () => {
            try {
                const res = await fetch(`/api/history?symbol=${selectedCrypto.symbol}&interval=1m`, { signal: controller.signal })
                const data = await res.json()

                const formattedData = normalizeHistoryCandles(data)
                if (destroyed || sessionId !== chartSessionRef.current) return

                if (!formattedData.length) {
                    setChartPayloadInfo(null)
                    currentCandle.current = null
                    return
                }

                const lcData = formattedData.map(d => ({
                    time: (d.time > 10000000000 ? Math.floor(d.time / 1000) : d.time) as Time,
                    open: d.open,
                    high: d.high,
                    low: d.low,
                    close: d.close,
                }))
                const liveCandleSnapshot = currentCandle.current

                // 1. Filter out invalid/NaN data
                let validData = lcData.filter(d => d.open > 0 && d.close > 0 && !isNaN(d.time as number))

                // 2. Strictly sort chronologically (oldest to newest)
                validData.sort((a, b) => (a.time as number) - (b.time as number))

                // 3. Deduplicate timestamps (lightweight-charts crashes on duplicates)
                const dedupedData: typeof validData = []
                for (const item of validData) {
                    if (dedupedData.length === 0 || dedupedData[dedupedData.length - 1].time !== item.time) {
                        dedupedData.push(item)
                    } else {
                        dedupedData[dedupedData.length - 1] = item // Overwrite duplicate with latest
                    }
                }

                try {
                    candleSeries.setData(dedupedData)

                    // Auto-scale recovery: fit historical data to view and ensure price series auto-scaling
                    chart.timeScale().fitContent()
                    candleSeries.priceScale().applyOptions({ autoScale: true })
                    setChartPayloadInfo({ count: dedupedData.length, first: dedupedData[0].time as number, last: dedupedData[dedupedData.length - 1].time as number })

                    const lastCandle = dedupedData[dedupedData.length - 1]
                    const lastHistoryTime = lastCandle.time as number

                    if (liveCandleSnapshot && (liveCandleSnapshot.time as number) >= lastHistoryTime) {
                        currentCandle.current = liveCandleSnapshot
                        candleSeries.update(liveCandleSnapshot)
                        setCurrentPrice(liveCandleSnapshot.close)
                        setLastPrice(liveCandleSnapshot.open)
                        currentPriceRef.current = liveCandleSnapshot.close
                    } else {
                        currentCandle.current = {
                            time: lastCandle.time,
                            open: lastCandle.open,
                            high: lastCandle.high,
                            low: lastCandle.low,
                            close: lastCandle.close
                        }
                        setCurrentPrice(lastCandle.close)
                        setLastPrice(lastCandle.open)
                        currentPriceRef.current = lastCandle.close
                    }
                } catch (err) {
                    console.error('candleSeries.setData failed', err)
                }
            } catch (e) {
                if (!destroyed) {
                    console.error("Failed to load chart data:", e)
                }
            }
        }

        loadChartData()

        const ro = new ResizeObserver(entries => {
            if (!entries.length || destroyed) return
            const { width, height } = entries[0].contentRect
            chart.applyOptions({ width, height })
        })
        ro.observe(chartContainerRef.current)

        return () => {
            destroyed = true
            controller.abort()
            chartRef.current = null
            candleSeriesRef.current = null
            currentCandle.current = null
            try { ro.disconnect() } catch (e) { /* ignore */ }
            chart.remove()
        }
    }, [theme, selectedCrypto.symbol, mounted])

    // WebSocket for live updates
    useEffect(() => {
        // open a single, long-lived socket tied only to the currently selected symbol
        ws.current = new WebSocket('ws://localhost:3001')

        ws.current.onopen = () => console.log('WebSocket connected')
        ws.current.onclose = () => console.log('WebSocket disconnected')

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)

                // Catch the C++ Engine Reset Command
                if (data.type === 'sys' && data.msg === 'RESYNC') {
                    window.location.reload();
                    return;
                }

                // Symbol filter: ignore messages that don't belong to the selected asset
                if (data.type !== 'trade' || data.symbol !== selectedCrypto.symbol) return

                const { price, qty, side, time: timeStr } = data
                const numPrice = parseFloat(price)
                const numQty = parseFloat(qty)

                // FIX: Use Binance server time instead of Date.now() to prevent drift collision
                const tradeTimeSeconds = Math.floor(parseInt(timeStr) / 1000)
                const candleTime = Math.max(
                    Math.floor(tradeTimeSeconds / 60) * 60,
                    currentCandle.current ? (currentCandle.current.time as number) : 0
                )

                console.log("Live Trade Received:", data.symbol, numPrice, "Chart Time:", candleTime)

                // Data leak protection: ignore NaN or non-positive prices which cause "zero" drops
                if (isNaN(numPrice) || numPrice <= 0) return

                // Functional state update to avoid re-creating the socket on every tick
                setCurrentPrice(prev => {
                    setLastPrice(prev)
                    return numPrice
                })
                setHigh24h(prev => prev === null ? numPrice : Math.max(prev, numPrice))
                setLow24h(prev => prev === null ? numPrice : Math.min(prev, numPrice))

                // Null candle fallback: create a baseline candle when history is missing
                if (!currentCandle.current) {
                    currentCandle.current = {
                        time: candleTime as Time,
                        open: numPrice,
                        high: numPrice,
                        low: numPrice,
                        close: numPrice,
                    }
                }

                if (candleTime > (currentCandle.current.time as number)) {
                    const prevClose = currentCandle.current.close
                    currentCandle.current = {
                        time: candleTime as Time,
                        open: prevClose,
                        high: Math.max(prevClose, numPrice),
                        low: Math.min(prevClose, numPrice),
                        close: numPrice,
                    }
                } else {
                    currentCandle.current.close = numPrice
                    currentCandle.current.high = Math.max(currentCandle.current.high, numPrice)
                    currentCandle.current.low = Math.min(currentCandle.current.low, numPrice)
                }

                candleSeriesRef.current?.update(currentCandle.current)
                chartRef.current?.timeScale().scrollToRealTime()

                setTrades(prev => [
                    { id: Math.random().toString(36).substr(2, 5), price: numPrice, qty: numQty, side, time: timeStr },
                    ...prev.slice(0, 24),
                ])

                generateOrderBook(numPrice)
            } catch (e) {
                console.error(e)
            }
        }

        return () => {
            ws.current?.close()
            ws.current = null
        }

        // Only re-create the socket when the user switches the symbol
    }, [selectedCrypto.symbol])

    // State cleanup on asset switch
    useEffect(() => {
        // Clear recent trades & reset price counters
        setTrades([])
        const safePrice = toPositiveNumber(selectedCrypto.price)
        setCurrentPrice(safePrice)
        setLastPrice(safePrice)
        setHigh24h(null)
        setLow24h(null)
        currentPriceRef.current = safePrice
        currentCandle.current = null
        setChartPayloadInfo(null)
        activeSymbolRef.current = normalizeSymbol(selectedCrypto.symbol)

        // Reset order form inputs
        setOrderPrice("")
        setOrderQty("")

        // Clear order book (will regenerate on next ws tick)
        setAsks([])
        setBids([])
    }, [selectedCrypto.symbol])

    const generateOrderBook = (centerPrice: number) => {
        const safePrice = toPositiveNumber(centerPrice)
        if (safePrice === null) return
        const newAsks = []
        const newBids = []
        const spread = safePrice * 0.0001
        for (let i = 1; i <= 20; i++) {
            newAsks.push({ price: safePrice + (i * spread), qty: Math.random() * 1.5, total: 0 })
            newBids.push({ price: safePrice - (i * spread), qty: Math.random() * 1.5, total: 0 })
        }
        setAsks(newAsks.reverse())
        setBids(newBids)
    }

    const placeOrder = async (side: "buy" | "sell") => {
        const qtyValue = toPositiveNumber(orderQty)
        if (!qtyValue) return alert("Enter Quantity")
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('kairon_token')

            if (!token) {
                console.error('Authentication error: missing JWT token')
                alert('Authentication required. Please sign in again.')
                return
            }

            const priceValue = toPositiveNumber(orderPrice) ?? toPositiveNumber(currentPrice)
            if (!priceValue) {
                alert('Price unavailable. Wait for a valid market tick.')
                return
            }

            const res = await fetch('http://localhost:3001/api/trade/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    symbol: selectedCrypto.symbol,
                    side,
                    price: priceValue,
                    qty: qtyValue
                })
            })

            if (res.status === 401 || res.status === 403) {
                console.error('Authentication error placing order')
                alert('Authentication required. Please sign in again.')
                return
            }

            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                throw new Error(data.error || data.message || 'Failed to place order')
            }

            alert(`${side.toUpperCase()} order placed for ${selectedCrypto.symbol}!`)
        } catch (e) { alert("Gateway Error") }
    }

    const handleResync = async () => {
        try {
            await fetch('http://localhost:3001/api/trade/resync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol: selectedCrypto.symbol })
            });
        } catch (e) {
            console.error("Resync failed", e);
        }
    };

    const loadOpenOrders = async () => {
        try {
            const token = localStorage.getItem('kairon_token')
            const res = await fetch(`/api/orders/open?symbol=${selectedCrypto.symbol}USD`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (res.ok) {
                const data = await res.json()
                setOpenOrders(data.orders || [])
            }
        } catch (error) {
            console.error('Failed to load open orders:', error)
        }
    }

    const loadOrderHistory = async () => {
        try {
            const token = localStorage.getItem('kairon_token')
            const res = await fetch(`/api/orders/history?symbol=${selectedCrypto.symbol}USD`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (res.ok) {
                const data = await res.json()
                setOrderHistory(data.orders || [])
            }
        } catch (error) {
            console.error('Failed to load order history:', error)
        } finally {
            setLoadingOrders(false)
        }
    }

    const cancelOrder = async (orderId: string) => {
        try {
            const token = localStorage.getItem('kairon_token')
            const res = await fetch('/api/orders/cancel', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId })
            })
            if (res.ok) {
                setOpenOrders(prev => prev.filter(o => o.id !== orderId))
            }
        } catch (error) {
            console.error('Failed to cancel order:', error)
        }
    }

    const calculateDepth = useMemo(() => {
        const sortedBids = [...bids].sort((a, b) => b.price - a.price)
        const sortedAsks = [...asks].sort((a, b) => a.price - b.price)

        const cumulativeBids = []
        let cumulative = 0
        for (const bid of sortedBids) {
            cumulative += bid.qty
            cumulativeBids.push({ price: bid.price, cumulative })
        }

        const cumulativeAsks = []
        cumulative = 0
        for (const ask of sortedAsks) {
            cumulative += ask.qty
            cumulativeAsks.push({ price: ask.price, cumulative })
        }

        return { bids: cumulativeBids, asks: cumulativeAsks }
    }, [bids, asks])

    useEffect(() => {
        loadOpenOrders()
        loadOrderHistory()
    }, [selectedCrypto])

    const safeCurrentPrice = toPositiveNumber(currentPrice) ?? toPositiveNumber(selectedCrypto.price)
    const safeLastPrice = toPositiveNumber(lastPrice) ?? safeCurrentPrice
    const priceIsUp = safeCurrentPrice !== null && safeLastPrice !== null
        ? safeCurrentPrice >= safeLastPrice
        : true
    const displayPrice = safeCurrentPrice !== null ? formatPrice(safeCurrentPrice) : '--'
    const displayHigh = high24h !== null ? formatPrice(high24h) : '--'
    const displayLow = low24h !== null ? formatPrice(low24h) : '--'

    if (!mounted) return null

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#080E14] text-[#E6E6E6] font-sans selection:bg-[#00E5FF]/30">
            <TraderProfileCard isOpen={showProfileCard} onClose={() => setShowProfileCard(false)} />

            {/* 1. SYMBOL + MARKET INFO BAR */}
            <div className="border-b border-[#1A1D2A] px-4 py-2 shrink-0 bg-[#080E14] z-20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {/* Crypto Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowCryptoSelector(!showCryptoSelector)}
                                className="flex items-center gap-3 group"
                            >
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#E6E6E6] text-lg font-bold grayscale-[0.3] group-hover:grayscale-0 transition-all"
                                    style={{ backgroundColor: selectedCrypto.color }}
                                >
                                    {selectedCrypto.icon}
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-xl font-bold font-mono tracking-wider text-[#E6E6E6]">
                                            {selectedCrypto.symbol}/USDT
                                        </h1>
                                        <ChevronDown className={`w-4 h-4 text-[#8D8F98] transition-transform ${showCryptoSelector ? 'rotate-180' : ''}`} />
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-[#8D8F98] font-mono uppercase tracking-widest mt-0.5">
                                        <a href="#" className="underline decoration-[#8D8F98]/50 hover:text-[#00E5FF] hover:decoration-[#00E5FF]">KAIRON</a>
                                        <span>•</span>
                                        <span>PERPETUAL</span>
                                    </div>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {showCryptoSelector && (
                                <div className="absolute top-full mt-2 left-0 w-96 border border-[#1A1D2A] shadow-2xl z-50 overflow-hidden bg-[#0A0F1A]">
                                    <div className="p-3 border-b border-[#1A1D2A]">
                                        <div className="relative">
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[#00E5FF] font-mono text-sm">{'>'}</div>
                                            <input
                                                type="text"
                                                placeholder="Search markets..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-6 pr-4 py-2 bg-transparent border-0 border-b border-[#1A1D2A] outline-none focus:border-[#00E5FF] text-sm font-mono text-[#E6E6E6] placeholder-[#8D8F98]"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-3 border-b border-[#1A1D2A] bg-[#080E14]">
                                        <div className="text-[10px] text-[#8D8F98] uppercase tracking-[0.15em] font-semibold font-mono mb-2 px-1">FAVORITES</div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {AVAILABLE_CRYPTOS.filter(c => favorites.has(c.symbol)).slice(0, 6).map(crypto => (
                                                <button
                                                    key={crypto.symbol}
                                                    onClick={() => { setSelectedCrypto(crypto); setShowCryptoSelector(false) }}
                                                    className={`flex items-center gap-2 p-2 transition-all border ${selectedCrypto.symbol === crypto.symbol
                                                        ? 'border-[#00E5FF] bg-[#00E5FF]/10'
                                                        : 'border-[#1A1D2A] hover:border-[#8D8F98]'
                                                        }`}
                                                >
                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: crypto.color }}>
                                                        {crypto.icon}
                                                    </div>
                                                    <span className="text-xs font-medium font-mono text-[#E6E6E6]">{crypto.symbol}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="max-h-80 overflow-y-auto">
                                        <div className="text-[10px] text-[#8D8F98] uppercase tracking-[0.15em] font-semibold font-mono p-3 px-4">ALL MARKETS</div>
                                        {filteredCryptos.map(crypto => (
                                            <CryptoRow
                                                key={crypto.symbol}
                                                crypto={crypto}
                                                selected={selectedCrypto.symbol === crypto.symbol}
                                                onSelect={() => { setSelectedCrypto(crypto); setShowCryptoSelector(false) }}
                                                isFavorite={favorites.has(crypto.symbol)}
                                                onToggleFavorite={() => toggleFavorite(crypto.symbol)}
                                                formatPrice={formatDisplayPrice}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Price Display */}
                        <div className="pl-6 border-l border-[#1A1D2A]">
                            <div className={`text-2xl font-bold font-mono tabular-nums ${priceIsUp ? 'text-[#00E5FF]' : 'text-[#FF007A]'}`}>
                                {displayPrice}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-[#8D8F98] font-mono uppercase">MARK</span>
                            </div>
                        </div>

                        {/* 24h Change */}
                        <div className="pl-6 border-l border-[#1A1D2A]">
                            <div className={`text-sm font-bold font-mono ${selectedCrypto.change24h >= 0 ? 'text-[#00E5FF]' : 'text-[#FF007A]'}`}>
                                {selectedCrypto.change24h >= 0 ? '+' : ''}{selectedCrypto.change24h.toFixed(2)}%
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-[#8D8F98] font-mono uppercase">24H CHANGE</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats + Auth */}
                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex items-center gap-6">
                            <StatBox label="24H HIGH" value={displayHigh} color="text-[#E6E6E6]" />
                            <StatBox label="24H LOW" value={displayLow} color="text-[#E6E6E6]" />
                            <StatBox label="24H VOL(USDT)" value={formatNumber(selectedCrypto.volume24h)} color="text-[#E6E6E6]" />
                            <StatBox label="FUNDING / 8H" value="0.0100%" color="text-[#00E5FF]" />
                        </div>

                        <button
                            onClick={handleResync}
                            className="px-4 py-2 border border-[#FF007A]/50 bg-[#FF007A]/10 text-[#FF007A] font-bold font-mono uppercase text-xs hover:bg-[#FF007A]/20 hover:shadow-[0_0_15px_rgba(255,0,122,0.3)] transition-all"
                        >
                            RESYNC ENGINE
                        </button>

                        <div className="flex items-center gap-3 border border-white/10 bg-[#0d1117]/60 backdrop-blur-md px-3 py-2">
                            {!user ? (
                                <button
                                    onClick={handleAuthGate}
                                    className="px-4 py-2 bg-[#00E5FF] text-black font-bold font-mono uppercase text-xs hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all"
                                >
                                    Connect Wallet / Login
                                </button>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="text-[10px] font-mono text-[#8D8F98] uppercase tracking-widest">Signed In</div>
                                        <div className="text-sm font-mono text-[#E6E6E6]">{user.email}</div>
                                    </div>
                                    <div className="h-8 w-px bg-white/10" />
                                    <div className="text-right">
                                        <div className="text-[10px] font-mono text-[#8D8F98] uppercase tracking-widest">USDT</div>
                                        <div className="text-sm font-mono text-[#00E5FF]">
                                            {formatNumber(Number(user.balances?.USDT?.available ?? 0))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="ml-2 px-3 py-1.5 border border-white/10 text-xs font-mono uppercase text-[#E6E6E6] hover:text-[#00E5FF] transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN WORKSPACE */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                {/* LEFT COLUMN: Chart + Bottom Area */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* TOP: CHART AREA (Hero Section) */}
                    <div className="flex-1 flex flex-col overflow-hidden relative border-b lg:border-b-0 lg:border-r border-[#1A1D2A]">
                        {/* Timeframe Toolbar */}
                        <div className="h-10 border-b border-[#1A1D2A] flex items-center px-4 justify-between bg-[#0A0F1A]">
                            <div className="flex items-center gap-1 text-[11px] font-mono uppercase font-semibold">
                                {['1m', '5m', '15m', '1H', '4H', '1D'].map(tf => (
                                    <button key={tf} className="px-3 py-1.5 text-[#8D8F98] hover:text-[#E6E6E6] hover:bg-white/5 rounded transition-colors">
                                        {tf}
                                    </button>
                                ))}
                                <div className="w-px h-4 bg-[#1A1D2A] mx-2"></div>
                                <button className="px-3 py-1.5 text-[#8D8F98] hover:text-[#00E5FF] transition-colors flex items-center gap-2">
                                    <BarChart3 className="w-3.5 h-3.5" /> Indicators
                                </button>
                            </div>
                            <div className="flex items-center gap-3 text-[#8D8F98]">
                                <button className="hover:text-[#00E5FF] transition-colors"><Maximize className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>

                        {/* Chart Container */}
                        <div className="flex-1 relative bg-[#080E14] w-full">
                            <div ref={chartContainerRef} className="absolute inset-0" />
                            {chartPayloadInfo && (
                                <div className="absolute bottom-2 left-2 text-[10px] text-[#8D8F98] font-mono opacity-50 pointer-events-none z-10">
                                    KAIRON ENGINE • CHART SYNC • {chartPayloadInfo.count} CANDLES
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BOTTOM: Trading Panel + Orders */}
                    <div className="h-[340px] shrink-0 border-t border-[#1A1D2A] flex flex-col lg:flex-row bg-[#080E14]">

                        {/* TRADING PANEL */}
                        <div className="w-full lg:w-[360px] border-b lg:border-b-0 lg:border-r border-[#1A1D2A] p-5 flex flex-col shrink-0 bg-[#0A0F1A]">
                            {/* Tabs */}
                            <div className="flex items-center border-b border-[#1A1D2A] mb-5">
                                <button onClick={() => setOrderType('limit')} className={`flex-1 pb-3 text-xs font-mono font-bold uppercase transition-colors ${orderType === 'limit' ? 'text-[#00E5FF] border-b-2 border-[#00E5FF]' : 'text-[#8D8F98] hover:text-[#E6E6E6]'}`}>Limit</button>
                                <button onClick={() => setOrderType('market')} className={`flex-1 pb-3 text-xs font-mono font-bold uppercase transition-colors ${orderType === 'market' ? 'text-[#00E5FF] border-b-2 border-[#00E5FF]' : 'text-[#8D8F98] hover:text-[#E6E6E6]'}`}>Market</button>
                                <button className="flex-1 pb-3 text-xs font-mono font-bold uppercase text-[#8D8F98] hover:text-[#E6E6E6] transition-colors">Stop</button>
                            </div>

                            {/* Balance Info */}
                            <div className="flex justify-between items-center mb-5 text-[11px] font-mono">
                                <span className="text-[#8D8F98]">Avail Balance</span>
                                <span className="text-[#E6E6E6] font-bold">42,500.00 USDT</span>
                            </div>

                            {/* Form Inputs */}
                            <div className="space-y-4 mb-5">
                                {orderType === 'limit' && (
                                    <div className="relative border border-[#1A1D2A] bg-[#080E14] flex items-center p-2.5 group hover:border-[#8D8F98] transition-colors focus-within:border-[#00E5FF]">
                                        <span className="text-xs text-[#8D8F98] font-mono w-14">Price</span>
                                        <input type="number" value={orderPrice} onChange={e => setOrderPrice(e.target.value)} className="flex-1 bg-transparent text-right text-[#E6E6E6] text-sm font-mono outline-none" placeholder={displayPrice} />
                                        <span className="text-xs text-[#E6E6E6] font-mono ml-2">USDT</span>
                                    </div>
                                )}
                                <div className="relative border border-[#1A1D2A] bg-[#080E14] flex items-center p-2.5 group hover:border-[#8D8F98] transition-colors focus-within:border-[#00E5FF]">
                                    <span className="text-xs text-[#8D8F98] font-mono w-14">Size</span>
                                    <input type="number" value={orderQty} onChange={e => setOrderQty(e.target.value)} className="flex-1 bg-transparent text-right text-[#E6E6E6] text-sm font-mono outline-none" placeholder="0.00" />
                                    <span className="text-xs text-[#E6E6E6] font-mono ml-2">{selectedCrypto.symbol}</span>
                                </div>
                            </div>

                            {/* Percentage Slider Buttons */}
                            <div className="grid grid-cols-4 gap-2 mb-6">
                                {['25%', '50%', '75%', '100%'].map(pct => (
                                    <button key={pct} className="py-1 bg-[#1A1D2A]/50 text-[#8D8F98] text-[10px] font-mono hover:bg-[#1A1D2A] hover:text-[#E6E6E6] border border-transparent hover:border-[#8D8F98]/30 transition-colors">
                                        {pct}
                                    </button>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mt-auto">
                                <button onClick={() => (user ? placeOrder('buy') : handleAuthGate())} className="flex-1 py-3 bg-[#00E5FF] text-black font-bold font-mono uppercase text-sm hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all -skew-x-6 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                                    <span className="skew-x-6 block relative z-10">{user ? 'BUY / LONG' : 'LOGIN TO TRADE'}</span>
                                </button>
                                <button onClick={() => (user ? placeOrder('sell') : handleAuthGate())} className="flex-1 py-3 bg-[#FF007A] text-white font-bold font-mono uppercase text-sm hover:shadow-[0_0_20px_rgba(255,0,122,0.4)] transition-all -skew-x-6 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                                    <span className="skew-x-6 block relative z-10">{user ? 'SELL / SHORT' : 'LOGIN TO TRADE'}</span>
                                </button>
                            </div>
                        </div>

                        {/* OPEN ORDERS & PORTFOLIO */}
                        <div className="flex-1 flex flex-col bg-[#080E14] overflow-hidden">
                            <div className="flex gap-6 border-b border-[#1A1D2A] px-6 bg-[#0A0F1A]">
                                <button onClick={() => setOrdersTab('OPEN')} className={`py-4 text-[11px] font-mono uppercase tracking-wider font-bold transition-colors ${ordersTab === 'OPEN' ? 'text-[#00E5FF] border-b-2 border-[#00E5FF]' : 'text-[#8D8F98] hover:text-[#E6E6E6]'}`}>Positions (0)</button>
                                <button onClick={() => setOrdersTab('HISTORY')} className={`py-4 text-[11px] font-mono uppercase tracking-wider font-bold transition-colors ${ordersTab === 'HISTORY' ? 'text-[#00E5FF] border-b-2 border-[#00E5FF]' : 'text-[#8D8F98] hover:text-[#E6E6E6]'}`}>Open Orders ({openOrders.length})</button>
                                <button className="py-4 text-[11px] font-mono uppercase tracking-wider font-bold text-[#8D8F98] hover:text-[#E6E6E6] transition-colors">Order History</button>
                            </div>

                            <div className="flex-1 overflow-auto">
                                {ordersTab === 'OPEN' ? (
                                    <div className="h-full flex items-center justify-center text-[#8D8F98] font-mono text-[11px] uppercase tracking-widest">
                                        No Open Positions
                                    </div>
                                ) : (
                                    loadingOrders ? (
                                        <div className="text-center py-8 text-[#8D8F98] font-mono text-[11px]">Loading...</div>
                                    ) : openOrders.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-[#8D8F98] font-mono text-[11px] uppercase tracking-widest">
                                            No Active Orders
                                        </div>
                                    ) : (
                                        <table className="w-full font-mono text-[11px]">
                                            <thead className="bg-[#0A0F1A] sticky top-0">
                                                <tr className="border-b border-[#1A1D2A] text-[#8D8F98]">
                                                    <th className="text-left py-3 px-4 uppercase font-normal">Time</th>
                                                    <th className="text-left py-3 px-4 uppercase font-normal">Symbol</th>
                                                    <th className="text-center py-3 px-4 uppercase font-normal">Side</th>
                                                    <th className="text-right py-3 px-4 uppercase font-normal">Price</th>
                                                    <th className="text-right py-3 px-4 uppercase font-normal">Amount</th>
                                                    <th className="text-right py-3 px-4 uppercase font-normal">Filled</th>
                                                    <th className="text-center py-3 px-4 uppercase font-normal">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {openOrders.map((order) => (
                                                    <tr key={order.id} className="border-b border-[#1A1D2A] hover:bg-[#1A1D2A]/30 transition-colors">
                                                        <td className="py-3 px-4 text-[#8D8F98]">{new Date(order.timestamp).toLocaleTimeString()}</td>
                                                        <td className="py-3 px-4 text-[#E6E6E6] font-bold">{selectedCrypto.symbol}/USDT</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className={order.side === 'buy' ? 'text-[#00E5FF]' : 'text-[#FF007A]'}>
                                                                {order.side.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right text-[#E6E6E6]">
                                                            {order.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="py-3 px-4 text-right text-[#8D8F98]">{order.quantity.toFixed(4)}</td>
                                                        <td className="py-3 px-4 text-right text-[#8D8F98]">{order.filled.toFixed(1)}%</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <button onClick={() => cancelOrder(order.id)} className="text-[#FF007A] hover:text-[#E6E6E6] transition-colors underline decoration-[#FF007A]/50">
                                                                Cancel
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: ORDER BOOK */}
                <div className="w-full lg:w-[320px] shrink-0 border-l border-[#1A1D2A] bg-[#0A0F1A] flex flex-col h-[400px] lg:h-auto">
                    {/* Tabs */}
                    <div className="flex gap-6 border-b border-[#1A1D2A] px-4 bg-[#080E14]">
                        <button className="py-3 text-[11px] font-mono uppercase tracking-wider font-bold text-[#00E5FF] border-b-2 border-[#00E5FF]">Order Book</button>
                        <button className="py-3 text-[11px] font-mono uppercase tracking-wider font-bold text-[#8D8F98] hover:text-[#E6E6E6] transition-colors">Trades</button>
                    </div>

                    {/* Column Headers */}
                    <div className="grid grid-cols-3 text-[10px] text-[#8D8F98] px-3 py-2 font-medium font-mono uppercase tracking-wider">
                        <span>Price(USDT)</span>
                        <span className="text-right">Size({selectedCrypto.symbol})</span>
                        <span className="text-right">Total</span>
                    </div>

                    {/* Asks */}
                    <div className="flex-1 overflow-hidden flex flex-col justify-end px-1 pb-1">
                        {asks.map((a, i) => (
                            <OrderBookRow key={i} price={a.price} qty={a.qty} type="ask" formatPrice={formatPrice} />
                        ))}
                    </div>

                    {/* Spread Info */}
                    <div className="py-2.5 px-4 flex items-center justify-between bg-[#080E14] border-y border-[#1A1D2A]">
                        <div className="flex items-center gap-3">
                            <span className={`text-lg font-bold font-mono ${priceIsUp ? 'text-[#00E5FF]' : 'text-[#FF007A]'}`}>
                                {displayPrice}
                            </span>
                            {priceIsUp ? (
                                <span className="text-[#00E5FF] text-[10px]">↑</span>
                            ) : (
                                <span className="text-[#FF007A] text-[10px]">↓</span>
                            )}
                        </div>
                        <span className="text-[10px] text-[#8D8F98] font-mono underline decoration-dashed decoration-[#8D8F98]/50">
                            Spread 0.01
                        </span>
                    </div>

                    {/* Bids */}
                    <div className="flex-1 overflow-hidden flex flex-col justify-start px-1 pt-1">
                        {bids.map((b, i) => (
                            <OrderBookRow key={i} price={b.price} qty={b.qty} type="bid" formatPrice={formatPrice} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
