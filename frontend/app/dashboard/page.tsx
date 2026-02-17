"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import {
    TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight,
    Plus, Minus, DollarSign, Shield, ShoppingCart, LogIn, X
} from "lucide-react"

interface Holding {
    asset: string
    amount: number
    avgBuyPrice: number
}

interface ActivityItem {
    id: string
    type: 'LOGIN' | 'ORDER' | 'DEPOSIT' | 'WITHDRAW'
    timestamp: string
    details: string
    category: 'SECURITY' | 'FINANCIAL'
}

type FilterType = 'ALL' | 'SECURITY' | 'FINANCIAL'

export default function DashboardPage() {
    // Live price data from WebSocket
    const [livePrices, setLivePrices] = useState<Record<string, number>>({
        'BTC': 88077.50,
        'ETH': 3245.50,
        'SOL': 142.30,
        'BNB': 445.20,
    })

    // Holdings data
    const [holdings] = useState<Holding[]>([
        { asset: 'BTC', amount: 0.5234, avgBuyPrice: 85420.00 },
        { asset: 'ETH', amount: 2.8765, avgBuyPrice: 3180.25 },
        { asset: 'SOL', amount: 45.2300, avgBuyPrice: 138.50 },
        { asset: 'BNB', amount: 8.1200, avgBuyPrice: 438.90 },
    ])

    // USDT Balance
    const [usdtBalance, setUsdtBalance] = useState(100000)
    const [portfolioValue24hAgo] = useState(145000)

    // Activity log
    const [activities, setActivities] = useState<ActivityItem[]>([])
    const [loadingActivities, setLoadingActivities] = useState(true)
    const [activityFilter, setActivityFilter] = useState<FilterType>('ALL')

    // Modal state
    const [showModal, setShowModal] = useState(false)
    const [modalType, setModalType] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT')
    const [modalAmount, setModalAmount] = useState('')

    // Hover state for asset allocation
    const [activeAsset, setActiveAsset] = useState<string | null>(null)

    // WebSocket ref
    const wsRef = useRef<WebSocket | null>(null)

    // Load activities
    useEffect(() => {
        loadActivities()
    }, [])

    // WebSocket for live prices
    useEffect(() => {
        const interval = setInterval(() => {
            setLivePrices(prev => ({
                'BTC': prev['BTC'] * (1 + (Math.random() - 0.5) * 0.002),
                'ETH': prev['ETH'] * (1 + (Math.random() - 0.5) * 0.003),
                'SOL': prev['SOL'] * (1 + (Math.random() - 0.5) * 0.004),
                'BNB': prev['BNB'] * (1 + (Math.random() - 0.5) * 0.003),
            }))
        }, 2000)

        return () => {
            clearInterval(interval)
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [])

    // Load activity data
    const loadActivities = async () => {
        try {
            const token = localStorage.getItem('kairon_token')
            const res = await fetch('/api/activity/recent?limit=10', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (res.ok) {
                const data = await res.json()
                setActivities(data.activities)
            }
        } catch (error) {
            console.error('Failed to load activities:', error)
        } finally {
            setLoadingActivities(false)
        }
    }

    // Calculate total equity
    const totalEquity = useMemo(() => {
        const holdingsValue = holdings.reduce((acc, h) => {
            const price = livePrices[h.asset] || 0
            return acc + h.amount * price
        }, 0)

        return holdingsValue + usdtBalance
    }, [holdings, livePrices, usdtBalance])

    // Calculate 24h PnL
    const pnl24h = useMemo(() => {
        const change = totalEquity - portfolioValue24hAgo
        const changePercent = (change / portfolioValue24hAgo) * 100
        return { change, changePercent }
    }, [totalEquity, portfolioValue24hAgo])

    // Calculate asset allocation
    const assetAllocation = useMemo(() => {
        const allocations = holdings.map(h => {
            const value = h.amount * (livePrices[h.asset] || 0)
            const percentage = (value / totalEquity) * 100
            return {
                name: h.asset,
                value: percentage,
                absoluteValue: value
            }
        })

        // Add USDT
        allocations.push({
            name: 'USDT',
            value: (usdtBalance / totalEquity) * 100,
            absoluteValue: usdtBalance
        })

        // Group small allocations into "Others"
        const threshold = 1
        const major = allocations.filter(a => a.value >= threshold)
        const minor = allocations.filter(a => a.value < threshold)

        if (minor.length > 0) {
            const othersValue = minor.reduce((sum, a) => sum + a.value, 0)
            const othersAbsolute = minor.reduce((sum, a) => sum + a.absoluteValue, 0)
            major.push({
                name: 'Others',
                value: othersValue,
                absoluteValue: othersAbsolute
            })
        }

        return major.sort((a, b) => b.value - a.value)
    }, [holdings, livePrices, totalEquity, usdtBalance])

    // Filter activities
    const filteredActivities = useMemo(() => {
        if (activityFilter === 'ALL') return activities
        return activities.filter(a => a.category === activityFilter)
    }, [activities, activityFilter])

    // Handle deposit/withdraw
    const handleTransaction = () => {
        const amount = parseFloat(modalAmount)
        if (isNaN(amount) || amount <= 0) return

        if (modalType === 'DEPOSIT') {
            setUsdtBalance(prev => prev + amount)
        } else {
            if (amount > usdtBalance) {
                alert('Insufficient balance')
                return
            }
            setUsdtBalance(prev => prev - amount)
        }

        setShowModal(false)
        setModalAmount('')
    }

    // Asset colors
    const assetColors: Record<string, string> = {
        'BTC': '#F7931A',
        'ETH': '#627EEA',
        'SOL': '#9945FF',
        'BNB': '#F3BA2F',
        'USDT': '#26A17B',
        'Others': '#6B7280'
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">
                // COMMAND DASHBOARD
                            </p>
                            <h1 className="text-3xl font-bold font-mono tracking-wider text-white mb-2">
                                System Control Center
                            </h1>
                            <p className="text-sm text-gray-600">
                                Portfolio overview and system activity
                            </p>
                        </div>

                        <Link
                            href="/trade"
                            className="text-[#00E5FF] hover:text-[#00B8CC] text-sm font-mono uppercase tracking-widest transition-colors"
                        >
                            ← Back to Terminal
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">

                {/* Row 1: Portfolio Summary + Asset Allocation */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Portfolio Summary (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Total Equity Card */}
                        <div className="border border-white/10 bg-[#0A0B0D] p-8 hover:border-[#00E5FF]/30 transition-all duration-300 -skew-x-6">
                            <div className="skew-x-6">
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">
                                    Total Portfolio Equity
                                </p>
                                <p className="text-5xl font-bold font-mono text-[#00E5FF] mb-2">
                                    ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className="text-sm text-gray-600 font-mono">
                                    Live valuation across all assets
                                </p>
                            </div>
                        </div>

                        {/* 24h PnL Cards */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* 24h Change (Absolute) */}
                            <div className="border border-white/10 bg-[#0A0B0D] p-6 -skew-x-6">
                                <div className="skew-x-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        {pnl24h.change >= 0 ? (
                                            <ArrowUpRight className="w-4 h-4 text-[#00E5FF]" />
                                        ) : (
                                            <ArrowDownRight className="w-4 h-4 text-[#FF006E]" />
                                        )}
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">
                                            24h Change
                                        </p>
                                    </div>
                                    <p className={`text-2xl font-bold font-mono ${pnl24h.change >= 0 ? 'text-[#00E5FF]' : 'text-[#FF006E]'
                                        }`}>
                                        {pnl24h.change >= 0 ? '+' : ''}${Math.abs(pnl24h.change).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            {/* 24h Change (Percentage) */}
                            <div className="border border-white/10 bg-[#0A0B0D] p-6 -skew-x-6">
                                <div className="skew-x-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        {pnl24h.changePercent >= 0 ? (
                                            <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-[#FF006E]" />
                                        )}
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">
                                            24h Performance
                                        </p>
                                    </div>
                                    <p className={`text-2xl font-bold font-mono ${pnl24h.changePercent >= 0 ? 'text-[#00E5FF]' : 'text-[#FF006E]'
                                        }`}>
                                        {pnl24h.changePercent >= 0 ? '+' : ''}{pnl24h.changePercent.toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Asset Allocation Chart (1/3) */}
                    <div className="border border-white/10 bg-[#0A0B0D] p-8 hover:border-[#00E5FF]/30 transition-all duration-300">
                        <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-white mb-6">
                            Asset Allocation
                        </h2>

                        {/* Simple Donut Chart using SVG */}
                        <div className="flex items-center justify-center mb-6">
                            <svg width="200" height="200" viewBox="0 0 200 200">
                                {assetAllocation.map((asset, index) => {
                                    const startAngle = assetAllocation
                                        .slice(0, index)
                                        .reduce((sum, a) => sum + (a.value / 100) * 360, 0)
                                    const angle = (asset.value / 100) * 360
                                    const endAngle = startAngle + angle

                                    const startRad = (startAngle - 90) * (Math.PI / 180)
                                    const endRad = (endAngle - 90) * (Math.PI / 180)

                                    const innerRadius = 60
                                    const outerRadius = 90

                                    const x1 = 100 + outerRadius * Math.cos(startRad)
                                    const y1 = 100 + outerRadius * Math.sin(startRad)
                                    const x2 = 100 + outerRadius * Math.cos(endRad)
                                    const y2 = 100 + outerRadius * Math.sin(endRad)
                                    const x3 = 100 + innerRadius * Math.cos(endRad)
                                    const y3 = 100 + innerRadius * Math.sin(endRad)
                                    const x4 = 100 + innerRadius * Math.cos(startRad)
                                    const y4 = 100 + innerRadius * Math.sin(startRad)

                                    const largeArc = angle > 180 ? 1 : 0

                                    const path = `
                    M ${x1} ${y1}
                    A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
                    L ${x3} ${y3}
                    A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
                    Z
                  `

                                    return (
                                        <path
                                            key={asset.name}
                                            d={path}
                                            fill={assetColors[asset.name] || '#6B7280'}
                                            opacity={activeAsset && activeAsset !== asset.name ? 0.3 : 1}
                                            onMouseEnter={() => setActiveAsset(asset.name)}
                                            onMouseLeave={() => setActiveAsset(null)}
                                            className="cursor-pointer transition-opacity duration-200"
                                        />
                                    )
                                })}
                            </svg>
                        </div>

                        {/* Legend */}
                        <div className="space-y-2">
                            {assetAllocation.map(asset => (
                                <div
                                    key={asset.name}
                                    className={`flex items-center justify-between py-2 px-3 border border-white/10 transition-all duration-200 ${activeAsset === asset.name ? 'bg-white/5 border-[#00E5FF]/50' : ''
                                        }`}
                                    onMouseEnter={() => setActiveAsset(asset.name)}
                                    onMouseLeave={() => setActiveAsset(null)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3"
                                            style={{ backgroundColor: assetColors[asset.name] || '#6B7280' }}
                                        />
                                        <span className="text-sm font-mono text-white">{asset.name}</span>
                                    </div>
                                    <span className="text-sm font-mono text-gray-400">
                                        {asset.value.toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Row 2: Recent Activity */}
                <div className="border border-white/10 bg-[#0A0B0D] p-8 hover:border-[#00E5FF]/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-[#00E5FF]" />
                            Recent Activity
                        </h2>

                        {/* Filter Tabs */}
                        <div className="flex gap-0 border-b border-white/10">
                            {(['ALL', 'SECURITY', 'FINANCIAL'] as FilterType[]).map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActivityFilter(filter)}
                                    className={`px-4 py-2 text-xs font-mono uppercase tracking-widest transition-all duration-200 ${activityFilter === filter
                                            ? 'text-[#00E5FF] border-b-2 border-[#00E5FF]'
                                            : 'text-gray-600 hover:text-gray-400'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loadingActivities ? (
                        <div className="text-center py-8 text-gray-600 font-mono">
                            Loading activities...
                        </div>
                    ) : filteredActivities.length === 0 ? (
                        <div className="text-center py-8 border border-white/10 text-gray-600 font-mono">
                            No activity to display
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full font-mono text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Timestamp</th>
                                        <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Type</th>
                                        <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredActivities.map((activity) => (
                                        <tr
                                            key={activity.id}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-4 px-4 text-gray-400">
                                                {new Date(activity.timestamp).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-widest border ${activity.type === 'LOGIN'
                                                        ? 'text-[#00E5FF] border-[#00E5FF]/30 bg-[#00E5FF]/10'
                                                        : activity.type === 'ORDER'
                                                            ? 'text-gray-400 border-gray-500/30 bg-gray-500/10'
                                                            : 'text-[#00E5FF] border-[#00E5FF]/30 bg-[#00E5FF]/10'
                                                    }`}>
                                                    {activity.type === 'LOGIN' && <LogIn className="w-3 h-3" />}
                                                    {activity.type === 'ORDER' && <ShoppingCart className="w-3 h-3" />}
                                                    {activity.type === 'DEPOSIT' && <Plus className="w-3 h-3" />}
                                                    {activity.type === 'WITHDRAW' && <Minus className="w-3 h-3" />}
                                                    {activity.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-white">{activity.details}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Row 3: Quick Actions */}
                <div className="border border-white/10 bg-[#0A0B0D] p-8 hover:border-[#00E5FF]/30 transition-all duration-300">
                    <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-white mb-4">
                        Quick Actions
                    </h2>
                    <p className="text-xs text-gray-600 mb-6 uppercase tracking-widest font-mono">
                        Simulation Mode — Demo Funds Only
                    </p>

                    <div className="flex gap-6">
                        {/* Deposit Button */}
                        <button
                            onClick={() => {
                                setModalType('DEPOSIT')
                                setShowModal(true)
                            }}
                            className="py-3 px-6 bg-[#00E5FF] text-black font-bold font-mono uppercase tracking-widest text-sm -skew-x-6 hover:shadow-[0_0_20px_rgba(0,229,255,0.6)] transition-all duration-150 active:scale-95"
                        >
                            <span className="skew-x-6 flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                DEPOSIT USDT
                            </span>
                        </button>

                        {/* Withdraw Button */}
                        <button
                            onClick={() => {
                                setModalType('WITHDRAW')
                                setShowModal(true)
                            }}
                            className="py-3 px-6 border-2 border-[#FF006E] text-[#FF006E] hover:bg-[#FF006E] hover:text-black font-bold font-mono uppercase tracking-widest text-sm -skew-x-6 hover:shadow-[0_0_20px_rgba(255,0,110,0.6)] transition-all duration-150 active:scale-95"
                        >
                            <span className="skew-x-6 flex items-center gap-2">
                                <Minus className="w-4 h-4" />
                                WITHDRAW USDT
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Transfer Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#0A0B0D] border-2 border-[#00E5FF] max-w-md w-full p-8 shadow-[0_0_40px_rgba(0,229,255,0.3)]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-white">
                                {modalType} USDT
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Current Balance */}
                            <div className="border border-white/10 p-4 bg-black">
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-1">
                                    Available Balance
                                </p>
                                <p className="text-2xl font-bold font-mono text-white">
                                    ${usdtBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>

                            {/* Amount Input */}
                            <div>
                                <label className="block text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">
                                    Amount (USDT)
                                </label>
                                <input
                                    type="number"
                                    value={modalAmount}
                                    onChange={(e) => setModalAmount(e.target.value)}
                                    className="w-full px-4 py-3 bg-black border border-white/20 text-white font-mono text-lg focus:outline-none focus:border-[#00E5FF] focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all duration-200"
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>

                            {/* Confirm Button */}
                            <button
                                onClick={handleTransaction}
                                disabled={!modalAmount || parseFloat(modalAmount) <= 0}
                                className={`w-full py-3 px-6 font-bold font-mono uppercase tracking-widest text-sm transition-all duration-150 ${modalAmount && parseFloat(modalAmount) > 0
                                        ? modalType === 'DEPOSIT'
                                            ? 'bg-[#00E5FF] text-black hover:shadow-[0_0_20px_rgba(0,229,255,0.6)]'
                                            : 'bg-[#FF006E] text-black hover:shadow-[0_0_20px_rgba(255,0,110,0.6)]'
                                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                    }`}
                            >
                                CONFIRM {modalType}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
