"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useTheme } from '@/components/ThemeProvider'
import { TraderProfileCard } from '@/components/TraderProfileCard'
import { Crypto, Trade, OrderBookItem, AVAILABLE_CRYPTOS } from './types'
import { CryptoRow } from './components/CryptoRow'
import { StatBox, PortfolioStat, OrderBookRow } from './components/UIComponents'
import { formatNumber, formatPrice } from './utils'
import { ChevronDown, Zap, Wallet, BarChart3, TrendingUp, Activity, Star } from 'lucide-react'
import { createChart, ColorType, CrosshairMode, CandlestickSeries } from 'lightweight-charts'
import type { IChartApi, ISeriesApi, Time } from 'lightweight-charts'

export default function TradeTerminal() {
    const { theme } = useTheme()
    const [selectedCrypto, setSelectedCrypto] = useState<Crypto>(AVAILABLE_CRYPTOS[0])
    const [showCryptoSelector, setShowCryptoSelector] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [favorites, setFavorites] = useState(new Set(['BTC', 'ETH', 'SOL']))
    const [mounted, setMounted] = useState(false)
    const [showProfileCard, setShowProfileCard] = useState(false)

    // WebSocket state
    const [currentPrice, setCurrentPrice] = useState(0)
    const [lastPrice, setLastPrice] = useState(0)
    const [trades, setTrades] = useState<Trade[]>([])
    const [asks, setAsks] = useState<OrderBookItem[]>([])
    const [bids, setBids] = useState<OrderBookItem[]>([])

    // Order form state
    const [orderQty, setOrderQty] = useState("")
    const [orderPrice, setOrderPrice] = useState("")
    const [orderType, setOrderType] = useState<'limit' | 'market'>('limit')

    // Orders tab state
    const [ordersTab, setOrdersTab] = useState<'OPEN' | 'HISTORY'>('OPEN')
    const [openOrders, setOpenOrders] = useState<any[]>([])
    const [orderHistory, setOrderHistory] = useState<any[]>([])
    const [loadingOrders, setLoadingOrders] = useState(true)

    // Chart & WebSocket refs
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const ws = useRef<WebSocket | null>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
    const currentPriceRef = useRef(0)
    const currentCandle = useRef<{ time: Time; open: number; high: number; low: number; close: number } | null>(null)
    const [chartPayloadInfo, setChartPayloadInfo] = useState<{ count: number; first?: number; last?: number } | null>(null)

    useEffect(() => setMounted(true), [])

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

        const bgColor = theme === 'dark' ? '#0d1117' : '#ffffff'
        const textColor = theme === 'dark' ? '#8b949e' : '#57606a'
        const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#d0d7de'

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
                vertLine: { color: 'rgba(0, 229, 255, 0.5)', width: 1, style: 3 },
                horzLine: { color: 'rgba(0, 229, 255, 0.5)', width: 1, style: 3 },
            },
        })

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#00E5FF',
            downColor: '#FF006E',
            borderVisible: false,
            wickUpColor: '#00E5FF',
            wickDownColor: '#FF006E',
        })

        chartRef.current = chart
        candleSeriesRef.current = candleSeries

        let destroyed = false

        const loadChartData = async () => {
            try {
                const res = await fetch(`/api/history?symbol=${selectedCrypto.symbol}`)
                const data = await res.json()

                if (Array.isArray(data) && data.length > 0) {
                    const normalizeCandles = (raw: any[]): { time: number; open: number; high: number; low: number; close: number }[] => {
                        let arr: any[] = []
                        if (Array.isArray(raw[0])) {
                            arr = raw.map(d => ({
                                time: Math.floor(Number(d[0]) / 1000),
                                open: parseFloat(d[1]),
                                high: parseFloat(d[2]),
                                low: parseFloat(d[3]),
                                close: parseFloat(d[4])
                            }))
                        } else {
                            arr = raw.map(d => ({
                                time: Math.floor(Number(d.time)),
                                open: Number(d.open),
                                high: Number(d.high),
                                low: Number(d.low),
                                close: Number(d.close)
                            }))
                        }

                        arr = arr.filter(x => Number.isFinite(x.time) && Number.isFinite(x.open) && Number.isFinite(x.high) && Number.isFinite(x.low) && Number.isFinite(x.close))
                        arr.sort((a, b) => a.time - b.time)

                        const dedup: typeof arr = []
                        for (const c of arr) {
                            if (dedup.length && dedup[dedup.length - 1].time === c.time) {
                                dedup[dedup.length - 1] = c
                            } else {
                                dedup.push(c)
                            }
                        }

                        return dedup
                    }

                    const formattedData = normalizeCandles(data)

                    console.groupCollapsed('history -> chart payload')
                    console.log('normalizedLength', formattedData.length)
                    if (formattedData.length > 0) {
                        console.log('first', formattedData[0])
                        console.log('last', formattedData[formattedData.length - 1])
                    }
                    console.groupEnd()

                    if (formattedData.length > 0) {
                        const lcData = formattedData.map(d => ({ time: d.time as Time, open: d.open, high: d.high, low: d.low, close: d.close }))

                        if (!destroyed) {
                            try {
                                candleSeries.setData(lcData)
                                setChartPayloadInfo({ count: lcData.length, first: lcData[0].time as number, last: lcData[lcData.length - 1].time as number })

                                const lastCandle = lcData[lcData.length - 1]
                                currentCandle.current = {
                                    time: ((lastCandle.time as number) + 60) as Time,
                                    open: lastCandle.close,
                                    high: lastCandle.close,
                                    low: lastCandle.close,
                                    close: lastCandle.close
                                }
                                setCurrentPrice(lastCandle.close)
                                setLastPrice(lastCandle.open)
                            } catch (err) {
                                console.error('candleSeries.setData failed', err)
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to load chart data:", e)
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
            chartRef.current = null
            candleSeriesRef.current = null
            try { ro.disconnect() } catch (e) { /* ignore */ }
            chart.remove()
        }
    }, [theme, selectedCrypto.symbol, mounted])

    // WebSocket for live updates
    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:3001')

        ws.current.onopen = () => console.log('WebSocket connected')
        ws.current.onclose = () => console.log('WebSocket disconnected')

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                if (data.type === 'trade') {
                    const { price, qty, side, time: timeStr } = data
                    const numPrice = parseFloat(price)
                    const numQty = parseFloat(qty)

                    setLastPrice(currentPriceRef.current)
                    setCurrentPrice(numPrice)
                    currentPriceRef.current = numPrice

                    const nowSeconds = Math.floor(Date.now() / 1000)
                    const candleTime = Math.floor(nowSeconds / 60) * 60

                    if (!currentCandle.current) return

                    if ((candleTime as Time) > (currentCandle.current.time as Time)) {
                        const prevClose = currentCandle.current.close
                        currentCandle.current = {
                            time: candleTime as Time,
                            open: prevClose,
                            high: Math.max(prevClose, numPrice),
                            low: Math.min(prevClose, numPrice),
                            close: numPrice
                        }
                    } else {
                        currentCandle.current.close = numPrice
                        currentCandle.current.high = Math.max(currentCandle.current.high, numPrice)
                        currentCandle.current.low = Math.min(currentCandle.current.low, numPrice)
                    }

                    candleSeriesRef.current?.update(currentCandle.current)

                    setTrades(prev => [
                        { id: Math.random().toString(36).substr(2, 5), price: numPrice, qty: numQty, side, time: timeStr },
                        ...prev.slice(0, 24)
                    ])
                    generateOrderBook(numPrice)
                }
            } catch (e) { console.error(e) }
        }
        return () => { ws.current?.close() }
    }, [])

    const generateOrderBook = (centerPrice: number) => {
        const newAsks = []
        const newBids = []
        const spread = centerPrice * 0.0001
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
            await fetch('http://localhost:3001/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol: selectedCrypto.symbol,
                    side,
                    price: parseFloat(orderPrice) || currentPrice,
                    qty: parseFloat(orderQty)
                })
            })
            alert(`${side.toUpperCase()} order placed for ${selectedCrypto.symbol}!`)
        } catch (e) { alert("Gateway Error") }
    }

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

    // Calculate cumulative depth
    const calculateDepth = useMemo(() => {
        const sortedBids = [...bids].sort((a, b) => b.price - a.price)
        const sortedAsks = [...asks].sort((a, b) => a.price - b.price)

        let cumulativeBids = []
        let cumulative = 0
        for (const bid of sortedBids) {
            cumulative += bid.qty
            cumulativeBids.push({ price: bid.price, cumulative })
        }

        let cumulativeAsks = []
        cumulative = 0
        for (const ask of sortedAsks) {
            cumulative += ask.qty
            cumulativeAsks.push({ price: ask.price, cumulative })
        }

        return { bids: cumulativeBids, asks: cumulativeAsks }
    }, [bids, asks])

    // Load orders on symbol change
    useEffect(() => {
        loadOpenOrders()
        loadOrderHistory()
    }, [selectedCrypto])

    if (!mounted) return null

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-black text-white">
            <TraderProfileCard isOpen={showProfileCard} onClose={() => setShowProfileCard(false)} />

            {/* HEADER */}
            <div className="border-b border-white/10 px-6 py-4 shrink-0 bg-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        {/* Crypto Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowCryptoSelector(!showCryptoSelector)}
                                className="flex items-center gap-4 group"
                            >
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl font-bold grayscale-[0.3] group-hover:grayscale-0 transition-all"
                                    style={{ backgroundColor: selectedCrypto.color }}
                                >
                                    {selectedCrypto.icon}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-4xl font-bold font-mono tracking-wider">
                                            {selectedCrypto.symbol} / USD
                                        </h1>
                                        <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${showCryptoSelector ? 'rotate-180' : ''}`} />
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 font-mono">
                                        <span>PERPETUAL</span>
                                        <span>•</span>
                                        <span>RANK #{selectedCrypto.rank}</span>
                                    </div>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
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
                                                className="w-full pl-8 pr-4 py-3 bg-transparent border-0 border-b border-white/10 outline-none focus:border-[#00E5FF] text-sm font-mono text-white placeholder-gray-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-3 border-b border-white/5 bg-white/5">
                                        <div className="text-xs text-gray-600 uppercase tracking-[0.15em] font-semibold font-mono mb-2 px-2">FAVORITES</div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {AVAILABLE_CRYPTOS.filter(c => favorites.has(c.symbol)).slice(0, 6).map(crypto => (
                                                <button
                                                    key={crypto.symbol}
                                                    onClick={() => { setSelectedCrypto(crypto); setShowCryptoSelector(false) }}
                                                    className={`flex items-center gap-2 p-2 transition-all border ${selectedCrypto.symbol === crypto.symbol
                                                        ? 'border-[#00E5FF] bg-[#00E5FF]/10'
                                                        : 'border-white/10 hover:bg-white/5'
                                                        }`}
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
                                                onSelect={() => { setSelectedCrypto(crypto); setShowCryptoSelector(false) }}
                                                isFavorite={favorites.has(crypto.symbol)}
                                                onToggleFavorite={() => toggleFavorite(crypto.symbol)}
                                                formatPrice={formatPrice}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Price Display */}
                        <div className="pl-8 border-l border-white/10">
                            <div className="flex items-baseline gap-2">
                                <span className="text-xs text-gray-600 font-mono uppercase">MARK</span>
                                <span className={`text-5xl font-bold font-mono tabular-nums ${currentPrice >= lastPrice ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`}>
                                    ${formatPrice(currentPrice || selectedCrypto.price)}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                                <span className={`flex items-center gap-1 text-base font-bold font-mono ${selectedCrypto.change24h >= 0 ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`}>
                                    {selectedCrypto.change24h >= 0 ? '▲' : '▼'}
                                    {formatPrice(selectedCrypto.changeValue)}
                                </span>
                                <span className={`font-mono ${selectedCrypto.change24h >= 0 ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`}>
                                    {selectedCrypto.change24h >= 0 ? '+' : ''}{selectedCrypto.change24h.toFixed(2)}%
                                </span>
                                <span className="text-xs text-gray-700 font-mono">24H</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
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
                {/* Left Panel: Chart + Order */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* 2. CHART CONTAINER */}
                    <div className="flex-[2] relative overflow-hidden border border-white/10 m-1">
                        <div className="absolute top-0 left-0 right-0 z-10 px-4 py-2 border-b border-white/10 bg-black/80 backdrop-blur-sm">
                            <span className="text-xs font-mono text-gray-500 tracking-wider">// PRICE ACTION [1H]</span>
                        </div>

                        <div className="w-full h-full flex-1 min-h-[420px] pt-8 relative">
                            <div ref={chartContainerRef} className="absolute inset-0" />
                            {chartPayloadInfo && (
                                <div className="absolute top-2 right-2 bg-black/60 border border-white/10 text-xs text-gray-300 px-2 py-1 rounded">
                                    <div>candles: {chartPayloadInfo.count}</div>
                                    <div className="text-gray-400">first: {new Date((chartPayloadInfo.first || 0) * 1000).toISOString()}</div>
                                    <div className="text-gray-400">last: {new Date((chartPayloadInfo.last || 0) * 1000).toISOString()}</div>
                                </div>
                            )}
                        </div>

                        <div className="absolute inset-0 pointer-events-none" style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)'
                        }} />
                    </div>

                    {/* Market Depth */}
                    <div className="h-28 shrink-0 border-t border-white/10 bg-black/50">
                        <div className="px-4 py-2 border-b border-white/10">
                            <span className="text-xs font-mono text-gray-500 uppercase">// MARKET DEPTH</span>
                        </div>
                        <div className="h-full p-4">
                            <svg className="w-full h-full" viewBox="0 0 800 120" preserveAspectRatio="none">
                                {calculateDepth.bids.length > 0 && (
                                    <path
                                        d={`M 0 120 ${calculateDepth.bids.map((d, i) => {
                                            const x = (i / calculateDepth.bids.length) * 400
                                            const y = 120 - (d.cumulative / Math.max(...calculateDepth.bids.map(b => b.cumulative)) * 100)
                                            return `L ${x} ${y}`
                                        }).join(' ')} L 400 120 Z`}
                                        fill="url(#bidGradient)"
                                        stroke="#00E5FF"
                                        strokeWidth="1.5"
                                        opacity="0.8"
                                    />
                                )}
                                {calculateDepth.asks.length > 0 && (
                                    <path
                                        d={`M 400 120 ${calculateDepth.asks.map((d, i) => {
                                            const x = 400 + (i / calculateDepth.asks.length) * 400
                                            const y = 120 - (d.cumulative / Math.max(...calculateDepth.asks.map(a => a.cumulative)) * 100)
                                            return `L ${x} ${y}`
                                        }).join(' ')} L 800 120 Z`}
                                        fill="url(#askGradient)"
                                        stroke="#FF006E"
                                        strokeWidth="1.5"
                                        opacity="0.8"
                                    />
                                )}
                                <line x1="400" y1="0" x2="400" y2="120" stroke="white" strokeWidth="1" opacity="0.2" strokeDasharray="2,2" />
                                <defs>
                                    <linearGradient id="bidGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.05" />
                                    </linearGradient>
                                    <linearGradient id="askGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#FF006E" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#FF006E" stopOpacity="0.05" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>

                    {/* Order Panel */}
                    <div className="h-40 shrink-0 border-t border-white/10 p-4 bg-white/5">
                        <div className="h-full flex gap-8">
                            <div className="w-80 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold font-mono flex items-center gap-2 text-white uppercase text-sm">
                                        <Zap className="w-4 h-4 text-[#00E5FF]" />
                                        PLACE ORDER
                                    </h3>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setOrderType('limit')}
                                            className={`px-3 py-1 text-xs font-medium font-mono uppercase border ${orderType === 'limit' ? 'border-[#00E5FF] text-[#00E5FF]' : 'border-white/20 text-gray-500'}`}>
                                            LIMIT
                                        </button>
                                        <button onClick={() => setOrderType('market')}
                                            className={`px-3 py-1 text-xs font-medium font-mono uppercase border ${orderType === 'market' ? 'border-[#00E5FF] text-[#00E5FF]' : 'border-white/20 text-gray-500'}`}>
                                            MARKET
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {orderType === 'limit' && (
                                        <div>
                                            <label className="text-[10px] text-gray-600 mb-2 block font-mono uppercase">PRICE</label>
                                            <input type="number" placeholder={formatPrice(selectedCrypto.price)} value={orderPrice} onChange={e => setOrderPrice(e.target.value)} className="w-full pl-4 pr-2 pb-2 bg-transparent border-0 border-b border-white/20 text-white outline-none focus:border-[#00E5FF] font-mono placeholder-gray-700" />
                                        </div>
                                    )}
                                    <div className={orderType === 'market' ? 'col-span-2' : ''}>
                                        <label className="text-[10px] text-gray-600 mb-2 block font-mono uppercase">AMOUNT</label>
                                        <input type="number" placeholder="0.00" value={orderQty} onChange={e => setOrderQty(e.target.value)} className="w-full pl-2 pr-14 pb-2 bg-transparent border-0 border-b border-white/20 text-white outline-none focus:border-[#00E5FF] font-mono placeholder-gray-700" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button onClick={() => placeOrder('buy')} className="py-3 px-4 bg-[#00E5FF] text-black font-bold font-mono uppercase text-sm -skew-x-6 hover:shadow-[0_0_20px_rgba(0,229,255,0.6)]">
                                        <span className="skew-x-6 block">BUY</span>
                                    </button>
                                    <button onClick={() => placeOrder('sell')} className="py-3 px-4 border-2 border-[#FF006E] text-[#FF006E] hover:bg-[#FF006E] hover:text-black font-bold font-mono uppercase text-sm -skew-x-6 hover:shadow-[0_0_20px_rgba(255,0,110,0.6)]">
                                        <span className="skew-x-6 block">SELL</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-4 gap-6 pl-8 border-l border-white/10">
                                <PortfolioStat label="AVAILABLE BALANCE" value="$42,500.00" icon={<Wallet className="w-4 h-4" />} />
                                <PortfolioStat label="PORTFOLIO VALUE" value="$142,059.20" icon={<BarChart3 className="w-4 h-4" />} showSparkline />
                                <PortfolioStat label="UNREALIZED P&L" value="+$1,203.50" color="text-[#00E5FF]" icon={<TrendingUp className="w-4 h-4" />} />
                                <PortfolioStat label="TODAY'S P&L" value="+$458.32" color="text-[#00E5FF]" icon={<Activity className="w-4 h-4" />} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Order Book */}
                <div className="w-80 shrink-0 flex flex-col border-l border-white/10 bg-black">
                    <div className="border-b border-white/10 px-4 py-3 bg-white/5">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-gray-500">L2 MARKET DEPTH</h3>
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="grid grid-cols-3 text-[10px] text-gray-600 px-3 py-2 border-b border-white/5 font-medium font-mono uppercase">
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
                            <span className="text-xs text-gray-700 font-mono uppercase">SPREAD</span>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col justify-start px-1">
                            {bids.map((b, i) => (
                                <OrderBookRow key={i} price={b.price} qty={b.qty} type="bid" formatPrice={formatPrice} />
                            ))}
                        </div>
                    </div>

                    <div className="h-1/4 border-t border-white/10 flex flex-col">
                        <div className="grid grid-cols-3 text-[10px] text-gray-600 px-3 py-2 border-b border-white/5 font-medium font-mono uppercase">
                            <span>PRICE</span>
                            <span className="text-right">SIZE</span>
                            <span className="text-right">TIME</span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {trades.map(t => (
                                <div key={t.id} className="grid grid-cols-3 px-3 py-1 text-xs hover:bg-white/5 font-mono">
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

            {/* Orders Tab */}
            <div className="border-t border-white/10 bg-[#0A0B0D]">
                <div className="flex gap-0 border-b border-white/10 px-6">
                    <button onClick={() => setOrdersTab('OPEN')} className={`px-6 py-3 text-xs font-mono uppercase ${ordersTab === 'OPEN' ? 'text-[#00E5FF] border-b-2 border-[#00E5FF]' : 'text-gray-600'}`}>
                        Open Orders
                    </button>
                    <button onClick={() => setOrdersTab('HISTORY')} className={`px-6 py-3 text-xs font-mono uppercase ${ordersTab === 'HISTORY' ? 'text-[#00E5FF] border-b-2 border-[#00E5FF]' : 'text-gray-600'}`}>
                        Order History
                    </button>
                </div>

                <div className="p-6">
                    {ordersTab === 'OPEN' ? (
                        loadingOrders ? (
                            <div className="text-center py-8 text-gray-600 font-mono text-sm">Loading orders...</div>
                        ) : openOrders.length === 0 ? (
                            <div className="text-center py-12 text-gray-600 font-mono uppercase tracking-widest text-sm">NO ACTIVE ORDERS</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full font-mono text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Order ID</th>
                                            <th className="text-center py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Side</th>
                                            <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Price</th>
                                            <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Quantity</th>
                                            <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Filled</th>
                                            <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Timestamp</th>
                                            <th className="text-center py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {openOrders.map((order) => (
                                            <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 text-gray-400">{order.id.substring(0, 8)}...</td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest -skew-x-6 ${order.side === 'buy' ? 'text-[#00E5FF] border border-[#00E5FF]/30 bg-[#00E5FF]/10' : 'text-[#FF006E] border border-[#FF006E]/30 bg-[#FF006E]/10'
                                                        }`}>
                                                        <span className="skew-x-6">{order.side}</span>
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right text-white">
                                                    ${order.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-4 px-4 text-right text-gray-400">{order.quantity.toFixed(4)}</td>
                                                <td className="py-4 px-4 text-right text-gray-400">{order.filled.toFixed(1)}%</td>
                                                <td className="py-4 px-4 text-gray-400">{new Date(order.timestamp).toLocaleString()}</td>
                                                <td className="py-4 px-4 text-center">
                                                    <button onClick={() => cancelOrder(order.id)} className="py-1 px-3 border border-[#FF006E] text-[#FF006E] hover:bg-[#FF006E] hover:text-black font-bold font-mono uppercase tracking-widest text-xs -skew-x-6 hover:shadow-[0_0_15px_rgba(255,0,110,0.4)]">
                                                        <span className="skew-x-6 block">CANCEL</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : (
                        loadingOrders ? (
                            <div className="text-center py-8 text-gray-600 font-mono text-sm">Loading history...</div>
                        ) : orderHistory.length === 0 ? (
                            <div className="text-center py-12 text-gray-600 font-mono uppercase tracking-widest text-sm">NO ORDER HISTORY</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full font-mono text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Timestamp</th>
                                            <th className="text-center py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Side</th>
                                            <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Price</th>
                                            <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Quantity</th>
                                            <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Fee</th>
                                            <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Realized PnL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderHistory.map((order) => (
                                            <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 text-gray-400">{new Date(order.timestamp).toLocaleString()}</td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest -skew-x-6 ${order.side === 'buy' ? 'text-[#00E5FF] border border-[#00E5FF]/30 bg-[#00E5FF]/10' : 'text-[#FF006E] border border-[#FF006E]/30 bg-[#FF006E]/10'
                                                        }`}>
                                                        <span className="skew-x-6">{order.side}</span>
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right text-white">
                                                    ${order.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-4 px-4 text-right text-gray-400">{order.quantity.toFixed(4)}</td>
                                                <td className="py-4 px-4 text-right text-gray-500">${order.fee.toFixed(2)}</td>
                                                <td className={`py-4 px-4 text-right font-bold ${order.realizedPnL >= 0 ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`}>
                                                    {order.realizedPnL >= 0 ? '+' : ''}${Math.abs(order.realizedPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}
