"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Search, TrendingUp, TrendingDown, Star, Menu, Terminal, Wallet, BarChart3, Activity, ArrowUpRight, ArrowRight } from "lucide-react"
import { StockTicker } from "@/components/LandingPage/Ticker"
import { TraderProfileCard } from "@/components/TraderProfileCard"

interface CryptoData {
    symbol: string
    name: string
    price: number
    change24h: number
    volume24h: number
    marketCap: number
    icon: string
    color: string
}

const MARKET_DATA: CryptoData[] = [
    { symbol: 'BTC', name: 'Bitcoin', price: 88022.16, change24h: 0.33, volume24h: 35.8, marketCap: 1.75, icon: '₿', color: '#F7931A' },
    { symbol: 'ETH', name: 'Ethereum', price: 2913.13, change24h: 0.87, volume24h: 24.51, marketCap: 351.91, icon: 'Ξ', color: '#627EEA' },
    { symbol: 'USDT', name: 'Tether', price: 1.00, change24h: -0.04, volume24h: 83.45, marketCap: 186.27, icon: '₮', color: '#26A17B' },
    { symbol: 'BNB', name: 'BNB', price: 883.23, change24h: 1.40, volume24h: 1.97, marketCap: 120.43, icon: '🔶', color: '#F3BA2F' },
    { symbol: 'XRP', name: 'XRP', price: 1.89, change24h: 0.25, volume24h: 2.46, marketCap: 114.93, icon: '✕', color: '#23292F' },
    { symbol: 'SOL', name: 'Solana', price: 142.30, change24h: 1.17, volume24h: 3.2, marketCap: 61.0, icon: '◎', color: '#9945FF' },
    { symbol: 'ADA', name: 'Cardano', price: 1.12, change24h: -0.95, volume24h: 0.98, marketCap: 39.0, icon: '₳', color: '#0033AD' },
    { symbol: 'AVAX', name: 'Avalanche', price: 78.90, change24h: 4.12, volume24h: 0.75, marketCap: 32.0, icon: '🔺', color: '#E84142' },
    { symbol: 'DOT', name: 'Polkadot', price: 18.45, change24h: -1.23, volume24h: 0.52, marketCap: 28.5, icon: '●', color: '#E6007A' },
    { symbol: 'MATIC', name: 'Polygon', price: 1.42, change24h: 2.15, volume24h: 0.61, marketCap: 13.2, icon: '⬡', color: '#8247E5' },
]

export default function MarketsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [showProfileCard, setShowProfileCard] = useState(false)

    const categories = ["All", "Hot", "New", "Top Gainer", "Top Volume"]

    const filteredData = MARKET_DATA.filter(crypto =>
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-black text-white">
            {/* 1. TOP TICKER */}
            <div className="relative z-50">
                <StockTicker />
            </div>

            {/* Trader Profile Card */}
            <TraderProfileCard isOpen={showProfileCard} onClose={() => setShowProfileCard(false)} />

            {/* 2. STATS DASHBOARD - Cards with glow on hover */}
            <div className="pt-8 pb-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Available Balance Card */}
                        <div className="group bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded transition-all duration-200 hover:border-[#00E5FF] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] cursor-default">
                            <div className="flex items-center gap-3 mb-3">
                                <Wallet className="w-5 h-5 text-[#00E5FF]" />
                                <span className="text-xs text-gray-500 font-mono uppercase tracking-[0.15em]">Available Balance</span>
                            </div>
                            <div className="text-3xl font-bold font-mono text-white">$42,500.00</div>
                        </div>

                        {/* Portfolio Value Card */}
                        <div className="group bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded transition-all duration-200 hover:border-[#00E5FF] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] cursor-default">
                            <div className="flex items-center gap-3 mb-3">
                                <BarChart3 className="w-5 h-5 text-[#00E5FF]" />
                                <span className="text-xs text-gray-500 font-mono uppercase tracking-[0.15em]">Portfolio Value</span>
                            </div>
                            <div className="text-3xl font-bold font-mono text-white">$142,059.20</div>
                        </div>

                        {/* Total P&L Card */}
                        <div className="group bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded transition-all duration-200 hover:border-[#00E5FF] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] cursor-default">
                            <div className="flex items-center gap-3 mb-3">
                                <TrendingUp className="w-5 h-5 text-[#00E5FF]" />
                                <span className="text-xs text-gray-500 font-mono uppercase tracking-[0.15em]">Total P&L</span>
                            </div>
                            <div className="text-3xl font-bold font-mono text-[#00E5FF] flex items-center gap-2">
                                <ArrowUpRight className="w-6 h-6" />
                                +$1,203.50
                            </div>
                        </div>

                        {/* Today's P&L Card */}
                        <div className="group bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded transition-all duration-200 hover:border-[#00E5FF] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] cursor-default">
                            <div className="flex items-center gap-3 mb-3">
                                <Activity className="w-5 h-5 text-[#00E5FF]" />
                                <span className="text-xs text-gray-500 font-mono uppercase tracking-[0.15em]">Today's P&L</span>
                            </div>
                            <div className="text-3xl font-bold font-mono text-[#00E5FF] flex items-center gap-2">
                                <ArrowUpRight className="w-6 h-6" />
                                +$458.32
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* 3. MARKET OVERVIEW HEADER */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <h1 className="text-6xl font-bold uppercase tracking-[0.2em] text-white">MARKET OVERVIEW</h1>
                            <div className="px-3 py-1 border border-[#00E5FF] rounded text-xs font-mono text-[#00E5FF] tracking-[0.15em]">
                                // LIVE FEED
                            </div>
                        </div>
                        <p className="text-gray-500 font-mono text-sm tracking-wide">
                            REAL-TIME CRYPTOCURRENCY MARKET DATA AND ANALYTICS
                        </p>
                    </div>

                    {/* 4. SEARCH & FILTERS - Command line style */}
                    <div className="mb-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                        {/* Terminal-style filters */}
                        <div className="flex gap-2 overflow-x-auto">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 text-xs font-mono whitespace-nowrap uppercase tracking-[0.15em] transition-all duration-150 border ${selectedCategory === category
                                        ? 'border-[#00E5FF] text-[#00E5FF] bg-[#00E5FF]/10'
                                        : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Command line search */}
                        <div className="relative w-full md:w-80">
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-[#00E5FF] font-mono text-sm">{'>'}_</div>
                            <input
                                type="text"
                                placeholder="Search asset..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 bg-transparent border-0 border-b-2 border-white/10 text-sm font-mono text-white placeholder-gray-600 focus:border-[#00E5FF] focus:outline-none transition-colors duration-150"
                            />
                        </div>
                    </div>

                    {/* 5. MARKET TABLE → TERMINAL LIST */}
                    <div className="border-t border-white/10">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-xs font-mono text-gray-600 font-semibold uppercase tracking-[0.15em]">
                            <div className="col-span-3">ASSET</div>
                            <div className="col-span-2 text-right">PRICE</div>
                            <div className="col-span-2 text-right">24H CHANGE</div>
                            <div className="col-span-2 text-right">24H VOLUME</div>
                            <div className="col-span-2 text-right">MARKET CAP</div>
                            <div className="col-span-1 text-right">ACTION</div>
                        </div>

                        {/* Terminal List */}
                        <div>
                            {filteredData.length > 0 ? (
                                filteredData.map((crypto) => (
                                    <div
                                        key={crypto.symbol}
                                        className="group grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/5 hover:border-l-2 hover:border-l-[#00E5FF] transition-all duration-150 cursor-pointer"
                                    >
                                        {/* Asset */}
                                        <div className="col-span-3 flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm grayscale group-hover:grayscale-0 transition-all duration-150"
                                                style={{ backgroundColor: crypto.color }}
                                            >
                                                {crypto.icon}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-[#00E5FF] transition-colors duration-150 font-mono uppercase tracking-wide">
                                                    {crypto.symbol}
                                                </div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wide">{crypto.name}</div>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="col-span-2 text-right font-mono tabular-nums text-white text-lg font-semibold flex items-center justify-end">
                                            ${crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>

                                        {/* 24h Change */}
                                        <div className="col-span-2 text-right flex items-center justify-end">
                                            <span
                                                className={`inline-flex items-center gap-1 font-mono tabular-nums font-semibold ${crypto.change24h >= 0 ? 'text-[#00E5FF]' : 'text-[#FF006E]'
                                                    }`}
                                            >
                                                {crypto.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                                            </span>
                                        </div>

                                        {/* 24h Volume */}
                                        <div className="col-span-2 text-right font-mono tabular-nums text-gray-400 flex items-center justify-end">
                                            ${crypto.volume24h.toFixed(2)}B
                                        </div>

                                        {/* Market Cap */}
                                        <div className="col-span-2 text-right font-mono tabular-nums text-gray-400 flex items-center justify-end">
                                            ${crypto.marketCap.toFixed(2)}T
                                        </div>

                                        {/* Trade Button */}
                                        <div className="col-span-1 flex items-center justify-end">
                                            <Link href={`/trade`}>
                                                <button className="px-3 py-1.5 border border-[#00E5FF] text-[#00E5FF] text-xs font-mono uppercase tracking-wider hover:bg-[#00E5FF] hover:text-black transition-all duration-150 flex items-center gap-1">
                                                    TRADE
                                                    <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center">
                                    <div className="text-gray-500 font-mono text-sm tracking-wide">
                                        {'>'} NO ASSETS FOUND MATCHING "{searchQuery}"
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
