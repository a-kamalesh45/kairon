"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { useAuth } from '@/context/AuthContext'
import {
    TrendingUp, TrendingDown, Download, ArrowUpRight, ArrowDownRight,
    Wallet, Activity, Clock, BarChart3
} from "lucide-react"

interface Holding {
    asset: string
    amount: number
    avgBuyPrice: number
}

interface Trade {
    id: string
    timestamp: string
    asset: string
    side: 'buy' | 'sell'
    quantity: number
    price: number
    fee: number
    realizedPnL: number
}

export default function PortfolioPage() {
    // 1. Auth & Real Wallet Balances
    const { user, isLoading } = useAuth(); 

    // 2. Live Price State
    const [livePrices, setLivePrices] = useState<Record<string, number>>({});
    const wsRef = useRef<WebSocket | null>(null);

    // Fetch Baseline & Connect to Kairon Gateway
    useEffect(() => {
        const fetchBaselinePrices = async () => {
            try {
                const res = await fetch('https://api.binance.com/api/v3/ticker/price');
                const data = await res.json();
                const prices: Record<string, number> = {};
                data.forEach((ticker: { symbol: string, price: string }) => {
                    if (ticker.symbol.endsWith('USDT')) {
                        const asset = ticker.symbol.replace('USDT', '');
                        prices[asset] = parseFloat(ticker.price);
                    }
                });
                setLivePrices(prices);
            } catch (err) {
                console.error("Failed to fetch real baseline prices:", err);
            }
        };

        fetchBaselinePrices();

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.symbol && data.price) {
                    const asset = data.symbol.toUpperCase().replace('USDT', '');
                    setLivePrices(prev => ({
                        ...prev,
                        [asset]: parseFloat(data.price)
                    }));
                }
            } catch (err) {}
        };

        wsRef.current = ws;

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    // Safely Calculate Total USDT Balance
    const usdtBalance = useMemo(() => {
        if (!user || !user.balances || !user.balances.USDT) return 0;
        // Handle { available, locked } structure safely
        const available = user.balances.USDT.available || 0;
        const locked = user.balances.USDT.locked || 0;
        return available + locked;
    }, [user]);

    // 3. Dynamic Holdings from Database (Resolves nested object arithmetic bugs)
    const holdings = useMemo<Holding[]>(() => {
        if (!user || !user.balances) return [];

        return Object.keys(user.balances)
            .filter(asset => {
                if (asset === 'USDT') return false;
                const bal = user.balances[asset];
                const total = (bal?.available || 0) + (bal?.locked || 0);
                return total > 0;
            })
            .map(asset => {
                const bal = user.balances[asset];
                const totalAmount = (bal?.available || 0) + (bal?.locked || 0);
                
                return {
                    asset: asset,
                    amount: totalAmount, // Extracted pure number
                    avgBuyPrice: livePrices[asset] || 0 
                };
            });
    }, [user, livePrices]);

    // Trade history state
    const [trades, setTrades] = useState<Trade[]>([])
    const [loadingTrades, setLoadingTrades] = useState(true)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const tradesPerPage = 20

    // Load actual trade history from Database
    useEffect(() => {
        const loadTradeHistory = async () => {
            try {
                const token = localStorage.getItem('kairon_token')
                const res = await fetch('/api/trades/history', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })

                if (res.ok) {
                    const data = await res.json()
                    setTrades(data.trades || [])
                }
            } catch (error) {
                console.error('Failed to load real trade history:', error)
            } finally {
                setLoadingTrades(false)
            }
        }
        loadTradeHistory()
    }, [])

    // Real Mathematical Portfolio Metrics
    const portfolioMetrics = useMemo(() => {
        const totalValue = holdings.reduce((sum, holding) => {
            const currentPrice = livePrices[holding.asset] || 0
            return sum + (holding.amount * currentPrice)
        }, 0)

        const totalCost = holdings.reduce((sum, holding) => {
            return sum + (holding.amount * holding.avgBuyPrice)
        }, 0)

        const unrealizedPnL = totalValue - totalCost
        const unrealizedPnLPercent = totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0
        const realizedPnL = trades.reduce((sum, trade) => sum + (trade.realizedPnL || 0), 0)

        return {
            totalValue,
            totalCost,
            unrealizedPnL,
            unrealizedPnLPercent,
            realizedPnL,
        }
    }, [holdings, livePrices, trades])

    const winLossMetrics = useMemo(() => {
        const winningTrades = trades.filter(t => t.realizedPnL > 0).length
        const losingTrades = trades.filter(t => t.realizedPnL < 0).length
        const totalTrades = trades.length

        const winRatio = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
        const lossRatio = totalTrades > 0 ? 100 - winRatio : 0

        const totalWinPnL = trades.filter(t => t.realizedPnL > 0).reduce((sum, t) => sum + t.realizedPnL, 0)
        const totalLossPnL = trades.filter(t => t.realizedPnL < 0).reduce((sum, t) => sum + t.realizedPnL, 0)

        return { winningTrades, losingTrades, totalTrades, winRatio, lossRatio, totalWinPnL, totalLossPnL }
    }, [trades])

    const paginatedTrades = useMemo(() => {
        const startIndex = (currentPage - 1) * tradesPerPage
        return trades.slice(startIndex, startIndex + tradesPerPage)
    }, [trades, currentPage, tradesPerPage])

    const totalPages = Math.ceil(trades.length / tradesPerPage)

    const exportToCSV = () => {
        const headers = ["Timestamp", "Asset", "Side", "Quantity", "Price", "Fee", "Realized PnL"]
        const csvContent = [
            headers.join(","),
            ...trades.map(t => [
                t.timestamp, t.asset, t.side.toUpperCase(), t.quantity, t.price, t.fee, t.realizedPnL
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `kairon_real_history_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
                <div className="animate-pulse flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#00E5FF]" />
                    <span>Syncing Blockchain Database...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="border-b border-white/10 px-6 py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">
                                // PORTFOLIO & WALLET
                            </p>
                            <h1 className="text-3xl font-bold font-mono tracking-wider text-white mb-2">
                                Asset Position Overview
                            </h1>
                            <p className="text-sm text-gray-600">
                                Real-time asset valuation from internal matching engine
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/trade" className="text-[#00E5FF] hover:text-[#00B8CC] text-sm font-mono uppercase tracking-widest transition-colors">
                                ← Back to Terminal
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
                
                {/* 💳 REAL USDT BALANCE */}
                <div className="border border-[#00E5FF]/30 bg-[#00E5FF]/5 p-6 border-l-4 border-l-[#00E5FF]">
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-5 h-5 text-[#00E5FF]" />
                        <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-[#00E5FF]">
                            Available USDT Balance
                        </h2>
                    </div>
                    <p className="text-4xl font-bold font-mono text-white">
                        ${usdtBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="border border-white/10 bg-[#0A0B0D] p-6 -skew-x-6">
                        <div className="skew-x-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Wallet className="w-4 h-4 text-gray-500" />
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Total Value (Assets)</p>
                            </div>
                            <p className="text-2xl font-bold font-mono text-white">
                                ${portfolioMetrics.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    <div className="border border-white/10 bg-[#0A0B0D] p-6 -skew-x-6">
                        <div className="skew-x-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-4 h-4 text-gray-500" />
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Unrealized PnL</p>
                            </div>
                            <p className={`text-2xl font-bold font-mono ${portfolioMetrics.unrealizedPnL >= 0 ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`}>
                                {portfolioMetrics.unrealizedPnL >= 0 ? '+' : ''}{portfolioMetrics.unrealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                <span className="text-sm ml-2">({portfolioMetrics.unrealizedPnLPercent >= 0 ? '+' : ''}{portfolioMetrics.unrealizedPnLPercent.toFixed(2)}%)</span>
                            </p>
                        </div>
                    </div>

                    <div className="border border-white/10 bg-[#0A0B0D] p-6 -skew-x-6">
                        <div className="skew-x-6">
                            <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="w-4 h-4 text-gray-500" />
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Realized PnL</p>
                            </div>
                            <p className={`text-2xl font-bold font-mono ${portfolioMetrics.realizedPnL >= 0 ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`}>
                                {portfolioMetrics.realizedPnL >= 0 ? '+' : ''}{portfolioMetrics.realizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    <div className="border border-white/10 bg-[#0A0B0D] p-6 -skew-x-6">
                        <div className="skew-x-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Total Trades</p>
                            </div>
                            <p className="text-2xl font-bold font-mono text-white">{winLossMetrics.totalTrades}</p>
                        </div>
                    </div>
                </div>

                <div className="border border-white/10 bg-[#0A0B0D] p-8 hover:border-[#00E5FF]/30 transition-all duration-300">
                    <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-[#00E5FF]" /> Current Holdings
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full font-mono text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Asset</th>
                                    <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Amount Held</th>
                                    <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Avg Buy Price</th>
                                    <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Current Price</th>
                                    <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Current Value</th>
                                    <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Unrealized PnL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {holdings.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-gray-600">No crypto holdings yet in database.</td>
                                    </tr>
                                ) : (
                                    holdings.map((holding) => {
                                        const currentPrice = livePrices[holding.asset] || 0
                                        const currentValue = holding.amount * currentPrice
                                        const pnlAmount = currentValue - (holding.amount * holding.avgBuyPrice)
                                        const pnlPercent = holding.avgBuyPrice > 0 ? ((currentPrice - holding.avgBuyPrice) / holding.avgBuyPrice) * 100 : 0

                                        return (
                                            <tr key={holding.asset} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 text-white font-bold">{holding.asset}/USD</td>
                                                <td className="py-4 px-4 text-right text-gray-400">{holding.amount.toFixed(4)}</td>
                                                <td className="py-4 px-4 text-right text-gray-400">${holding.avgBuyPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="py-4 px-4 text-right text-white">${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="py-4 px-4 text-right text-white font-bold">${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className={`py-4 px-4 text-right font-bold ${pnlPercent >= 0 ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`}>
                                                    {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                                                    <div className="text-xs mt-1">({pnlAmount >= 0 ? '+' : ''}${Math.abs(pnlAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="border border-white/10 bg-[#0A0B0D] p-8 hover:border-[#00E5FF]/30 transition-all duration-300">
                    <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#00E5FF]" /> Win / Loss Analysis
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="border border-[#00E5FF]/30 bg-[#00E5FF]/5 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <ArrowUpRight className="w-5 h-5 text-[#00E5FF]" />
                                    <h3 className="text-base font-bold font-mono text-[#00E5FF] uppercase tracking-wider">Winning Trades</h3>
                                </div>
                                <span className="text-2xl font-bold font-mono text-[#00E5FF]">{winLossMetrics.winningTrades}</span>
                            </div>
                            <div className="space-y-2">
                                <p className="text-3xl font-bold font-mono text-[#00E5FF]">{winLossMetrics.winRatio.toFixed(1)}%</p>
                                <p className="text-sm text-gray-400">Total P&L: <span className="text-[#00E5FF] font-bold">+${winLossMetrics.totalWinPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                            </div>
                        </div>
                        <div className="border border-[#FF006E]/30 bg-[#FF006E]/5 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <ArrowDownRight className="w-5 h-5 text-[#FF006E]" />
                                    <h3 className="text-base font-bold font-mono text-[#FF006E] uppercase tracking-wider">Losing Trades</h3>
                                </div>
                                <span className="text-2xl font-bold font-mono text-[#FF006E]">{winLossMetrics.losingTrades}</span>
                            </div>
                            <div className="space-y-2">
                                <p className="text-3xl font-bold font-mono text-[#FF006E]">{winLossMetrics.lossRatio.toFixed(1)}%</p>
                                <p className="text-sm text-gray-400">Total P&L: <span className="text-[#FF006E] font-bold">-${Math.abs(winLossMetrics.totalLossPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-4 bg-black border border-white/10 overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-[#00E5FF] transition-all duration-500" style={{ width: `${winLossMetrics.winRatio}%` }}></div>
                        <div className="absolute top-0 right-0 h-full bg-[#FF006E] transition-all duration-500" style={{ width: `${winLossMetrics.lossRatio}%` }}></div>
                    </div>
                </div>

                <div className="border border-white/10 bg-[#0A0B0D] p-8 hover:border-[#00E5FF]/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-[#00E5FF]" /> Database Trade History
                        </h2>
                    </div>
                    {loadingTrades ? (
                        <div className="text-center py-8 text-gray-600 font-mono">Loading real trade history...</div>
                    ) : trades.length === 0 ? (
                        <div className="text-center py-8 border border-white/10 text-gray-600 font-mono">No trades yet. Start trading to build your history.</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto mb-6">
                                <table className="w-full font-mono text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Timestamp</th>
                                            <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Asset</th>
                                            <th className="text-center py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Side</th>
                                            <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Quantity</th>
                                            <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Price</th>
                                            <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Fee</th>
                                            <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Realized PnL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedTrades.map((trade) => (
                                            <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 text-gray-400">{new Date(trade.timestamp).toLocaleString()}</td>
                                                <td className="py-4 px-4 text-white font-bold">{trade.asset}/USD</td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest -skew-x-6 ${trade.side === 'buy' ? 'text-[#00E5FF] border border-[#00E5FF]/30 bg-[#00E5FF]/10' : 'text-[#FF006E] border border-[#FF006E]/30 bg-[#FF006E]/10'}`}>
                                                        <span className="skew-x-6">{trade.side}</span>
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right text-gray-400">{trade.quantity.toFixed(4)}</td>
                                                <td className="py-4 px-4 text-right text-white">${trade.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="py-4 px-4 text-right text-gray-500">${trade.fee.toFixed(2)}</td>
                                                <td className={`py-4 px-4 text-right font-bold ${trade.realizedPnL >= 0 ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`}>
                                                    {trade.realizedPnL >= 0 ? '+' : ''}${Math.abs(trade.realizedPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={`px-4 py-2 border font-mono text-xs uppercase tracking-widest ${currentPage === 1 ? 'border-white/10 text-gray-600 cursor-not-allowed' : 'border-white/20 text-white hover:border-[#00E5FF] hover:text-[#00E5FF]'} transition-colors`}>Prev</button>
                                    <span className="px-4 py-2 text-sm text-gray-400 font-mono">Page {currentPage} of {totalPages}</span>
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={`px-4 py-2 border font-mono text-xs uppercase tracking-widest ${currentPage === totalPages ? 'border-white/10 text-gray-600 cursor-not-allowed' : 'border-white/20 text-white hover:border-[#00E5FF] hover:text-[#00E5FF]'} transition-colors`}>Next</button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="border border-white/10 bg-[#0A0B0D] p-8 hover:border-[#00E5FF]/30 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-white mb-2 flex items-center gap-2">
                                <Download className="w-5 h-5 text-[#00E5FF]" /> Export Data
                            </h2>
                            <p className="text-sm text-gray-600">Download real trade history as CSV for external analysis</p>
                        </div>
                        <button onClick={exportToCSV} disabled={trades.length === 0} className={`py-3 px-6 font-bold font-mono uppercase tracking-widest text-sm -skew-x-6 transition-all duration-150 active:scale-95 ${trades.length > 0 ? 'bg-[#00E5FF] text-black hover:shadow-[0_0_20px_rgba(0,229,255,0.6)]' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>
                            <span className="skew-x-6 flex items-center gap-2">EXPORT REAL HISTORY <Download className="w-4 h-4" /></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}