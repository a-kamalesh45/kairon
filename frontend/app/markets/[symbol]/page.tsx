"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, TrendingUp, TrendingDown, Terminal, Star } from "lucide-react"
import { createChart, ColorType } from 'lightweight-charts'
import { ThemeToggle } from "@/components/ThemeToggle"

interface CryptoInfo {
    symbol: string
    name: string
    price: number
    change24h: number
    high24h: number
    low24h: number
    volume24h: number
    marketCap: number
    icon: string
    color: string
}

const CRYPTO_INFO: Record<string, CryptoInfo> = {
    btc: { symbol: 'BTC', name: 'Bitcoin', price: 88022.16, change24h: 0.33, high24h: 89500, low24h: 87200, volume24h: 35.8, marketCap: 1.75, icon: '₿', color: '#F7931A' },
    eth: { symbol: 'ETH', name: 'Ethereum', price: 2913.13, change24h: 0.87, high24h: 2980, low24h: 2850, volume24h: 24.51, marketCap: 351.91, icon: 'Ξ', color: '#627EEA' },
    usdt: { symbol: 'USDT', name: 'Tether', price: 1.00, change24h: -0.04, high24h: 1.001, low24h: 0.998, volume24h: 83.45, marketCap: 186.27, icon: '₮', color: '#26A17B' },
    bnb: { symbol: 'BNB', name: 'BNB', price: 883.23, change24h: 1.40, high24h: 920, low24h: 870, volume24h: 1.97, marketCap: 120.43, icon: '🔶', color: '#F3BA2F' },
    xrp: { symbol: 'XRP', name: 'XRP', price: 1.89, change24h: 0.25, high24h: 1.95, low24h: 1.82, volume24h: 2.46, marketCap: 114.93, icon: '✕', color: '#23292F' },
    sol: { symbol: 'SOL', name: 'Solana', price: 142.30, change24h: 1.17, high24h: 148, low24h: 138, volume24h: 3.2, marketCap: 61.0, icon: '◎', color: '#9945FF' },
    ada: { symbol: 'ADA', name: 'Cardano', price: 1.12, change24h: -0.95, high24h: 1.15, low24h: 1.08, volume24h: 0.98, marketCap: 39.0, icon: '₳', color: '#0033AD' },
    avax: { symbol: 'AVAX', name: 'Avalanche', price: 78.90, change24h: 4.12, high24h: 82, low24h: 75, volume24h: 0.75, marketCap: 32.0, icon: '🔺', color: '#E84142' },
    dot: { symbol: 'DOT', name: 'Polkadot', price: 18.45, change24h: -1.23, high24h: 19.2, low24h: 18.1, volume24h: 0.52, marketCap: 28.5, icon: '●', color: '#E6007A' },
    matic: { symbol: 'MATIC', name: 'Polygon', price: 1.42, change24h: 2.15, high24h: 1.48, low24h: 1.38, volume24h: 0.61, marketCap: 13.2, icon: '⬡', color: '#8247E5' },
}

// Generate mock candlestick data
function generateCandlestickData(basePrice: number) {
    const data = []
    const now = Math.floor(Date.now() / 1000)
    const oneDay = 24 * 60 * 60

    for (let i = 90; i >= 0; i--) {
        const time = now - i * oneDay
        const open = basePrice * (0.95 + Math.random() * 0.1)
        const close = open * (0.98 + Math.random() * 0.04)
        const high = Math.max(open, close) * (1 + Math.random() * 0.02)
        const low = Math.min(open, close) * (0.98 + Math.random() * 0.02)

        data.push({ time, open, high, low, close })
    }

    return data
}

export default function CryptoDetailPage() {
    const params = useParams()
    const symbol = (params?.symbol as string)?.toLowerCase()
    const crypto = CRYPTO_INFO[symbol]

    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<any>(null)
    const candlestickSeriesRef = useRef<any>(null)
    const [timeframe, setTimeframe] = useState('1D')

    useEffect(() => {
        if (!chartContainerRef.current || !crypto) return

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94A3B8',
            },
            grid: {
                vertLines: { color: '#1a1a1a' },
                horzLines: { color: '#1a1a1a' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 500,
            timeScale: {
                borderColor: '#2a2a2a',
                timeVisible: true,
            },
            rightPriceScale: {
                borderColor: '#2a2a2a',
            },
            crosshair: {
                mode: 1 as any,
            },
        })

        // Use addSeries instead of addCandlestickSeries for compatibility
        const candlestickSeries = chart.addSeries({
            type: 'Candlestick',
            upColor: '#00b8cc',
            downColor: '#cc0044',
            borderUpColor: '#00b8cc',
            borderDownColor: '#cc0044',
            wickUpColor: '#00b8cc',
            wickDownColor: '#cc0044',
        } as any)

        const data = generateCandlestickData(crypto.price)
        candlestickSeries.setData(data as any)

        chartRef.current = chart
        candlestickSeriesRef.current = candlestickSeries

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                })
            }
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
            chart.remove()
        }
    }, [crypto])

    if (!crypto) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-app)' }}>
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Cryptocurrency Not Found</h1>
                    <Link href="/markets" className="hover:underline" style={{ color: 'var(--color-neon-cyan)' }}>
                        Back to Markets
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>
            {/* Navigation */}
            <nav className="fixed w-full top-0 z-40 border-b border-white/5 backdrop-blur-md" style={{ backgroundColor: 'var(--color-bg-app)' + 'cc' }}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                        <div className="relative w-8 h-8 flex items-center justify-center border border-white/10 rounded overflow-hidden group-hover:border-(--color-neon-cyan) transition-colors" style={{ backgroundColor: 'var(--color-bg-panel)' }}>
                            <Terminal className="w-4 h-4" style={{ color: 'var(--color-text-primary)' }} />
                        </div>
                        <span className="text-xl font-bold tracking-widest" style={{ color: 'var(--color-text-primary)' }}>KAIRON</span>
                    </Link>

                    <div className="hidden md:flex gap-8 text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                        <Link href="/" className="hover:text-(--color-neon-cyan) transition-colors">HOME</Link>
                        <Link href="/markets" className="hover:text-(--color-neon-cyan) transition-colors">MARKETS</Link>
                        <Link href="/trade" className="hover:text-(--color-neon-cyan) transition-colors">TRADE</Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Link href="/trade">
                            <button className="px-5 py-2 text-xs font-bold font-mono border rounded uppercase tracking-wider transition-all" style={{ borderColor: 'var(--color-neon-cyan)', color: 'var(--color-text-primary)', backgroundColor: 'var(--color-neon-cyan)' }}>
                                Launch Terminal
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-24 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Back Button */}
                    <Link href="/markets" className="inline-flex items-center gap-2 mb-6 font-mono text-sm hover:text-(--color-neon-cyan) transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                        <ArrowLeft className="w-4 h-4" />
                        Back to Markets
                    </Link>

                    {/* Crypto Header */}
                    <div className="mb-8 flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                                style={{ backgroundColor: crypto.color }}
                            >
                                {crypto.icon}
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{crypto.name}</h1>
                                <p className="font-mono" style={{ color: 'var(--color-text-secondary)' }}>{crypto.symbol}</p>
                            </div>
                        </div>
                    </div>

                    {/* Price Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {/* Current Price */}
                        <div className="border border-white/10 rounded-lg p-4" style={{ backgroundColor: 'var(--color-bg-panel)' }}>
                            <div className="text-xs font-mono mb-1" style={{ color: 'var(--color-text-secondary)' }}>CURRENT PRICE</div>
                            <div className="text-2xl font-bold font-mono" style={{ color: 'var(--color-text-primary)' }}>
                                ${crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className={`text-sm font-mono mt-1 flex items-center gap-1`} style={{ color: crypto.change24h >= 0 ? 'var(--color-neon-cyan)' : 'var(--color-neon-pink)' }}>
                                {crypto.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                            </div>
                        </div>

                        {/* 24h High */}
                        <div className="border border-white/10 rounded-lg p-4" style={{ backgroundColor: 'var(--color-bg-panel)' }}>
                            <div className="text-xs font-mono mb-1" style={{ color: 'var(--color-text-secondary)' }}>24H HIGH</div>
                            <div className="text-2xl font-bold font-mono" style={{ color: 'var(--color-text-primary)' }}>
                                ${crypto.high24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>

                        {/* 24h Low */}
                        <div className="border border-white/10 rounded-lg p-4" style={{ backgroundColor: 'var(--color-bg-panel)' }}>
                            <div className="text-xs font-mono mb-1" style={{ color: 'var(--color-text-secondary)' }}>24H LOW</div>
                            <div className="text-2xl font-bold font-mono" style={{ color: 'var(--color-text-primary)' }}>
                                ${crypto.low24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>

                        {/* 24h Volume */}
                        <div className="border border-white/10 rounded-lg p-4" style={{ backgroundColor: 'var(--color-bg-panel)' }}>
                            <div className="text-xs font-mono mb-1" style={{ color: 'var(--color-text-secondary)' }}>24H VOLUME</div>
                            <div className="text-2xl font-bold font-mono" style={{ color: 'var(--color-text-primary)' }}>
                                ${crypto.volume24h.toFixed(2)}B
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="border border-white/10 rounded-lg p-6" style={{ backgroundColor: 'var(--color-bg-panel)' }}>
                        {/* Timeframe Selector */}
                        <div className="flex gap-2 mb-4">
                            {['1H', '1D', '1W', '1M', '3M', '1Y'].map((tf) => (
                                <button
                                    key={tf}
                                    onClick={() => setTimeframe(tf)}
                                    className={`px-4 py-2 rounded text-xs font-mono transition-all border ${timeframe === tf
                                        ? 'border-(--color-neon-cyan)'
                                        : 'border-white/10 hover:border-white/20'
                                        }`}
                                    style={{
                                        backgroundColor: timeframe === tf ? 'var(--color-neon-cyan)' + '10' : 'transparent',
                                        color: timeframe === tf ? 'var(--color-neon-cyan)' : 'var(--color-text-secondary)'
                                    }}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>

                        {/* Chart */}
                        <div ref={chartContainerRef} className="w-full" />
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex gap-4">
                        <Link href={`/trade?pair=${crypto.symbol}USDT`} className="flex-1">
                            <button className="w-full px-6 py-4 text-sm font-bold font-mono border text-black rounded uppercase tracking-wider transition-all hover:opacity-90" style={{ borderColor: 'var(--color-neon-cyan)', backgroundColor: 'var(--color-neon-cyan)' }}>
                                Trade {crypto.symbol}
                            </button>
                        </Link>
                        <button className="px-6 py-4 text-sm font-bold font-mono border border-white/20 rounded uppercase tracking-wider transition-all hover:border-white/40" style={{ backgroundColor: 'var(--color-bg-panel)', color: 'var(--color-text-primary)' }}>
                            <Star className="w-4 h-4 inline mr-2" />
                            Add to Watchlist
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}
