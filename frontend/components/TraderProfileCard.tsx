"use client"

import React from "react"
import { User, Key, FileText, Settings, LogOut, TrendingUp, Target, Activity, Zap } from "lucide-react"

interface TraderProfileCardProps {
    isOpen: boolean
    onClose: () => void
}

export function TraderProfileCard({ isOpen, onClose }: TraderProfileCardProps) {
    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Profile Card */}
            <div className="fixed top-20 right-6 z-50 w-96 bg-black/90 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,229,255,0.15)] transition-all duration-150">
                {/* 1. HEADER (IDENTITY) */}
                <div className="p-6 border-b border-white/10 bg-white/5">
                    <div className="flex items-start gap-4">
                        {/* Avatar - Hexagon Shape */}
                        <div className="relative">
                            <div
                                className="w-16 h-16 bg-gradient-to-br from-[#00E5FF] to-[#0099CC] flex items-center justify-center relative overflow-hidden"
                                style={{
                                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                                }}
                            >
                                <span className="text-black text-2xl font-bold font-mono">K</span>
                            </div>
                            {/* Glowing Ring */}
                            <div
                                className="absolute inset-0 -m-0.5"
                                style={{
                                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                                    background: 'linear-gradient(45deg, #00E5FF, transparent)',
                                    opacity: 0.3,
                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                }}
                            />
                        </div>

                        {/* Identity Info */}
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">TRADER_PRIME</h3>
                            <div className="text-sm text-[#00E5FF] font-mono mb-2">@kairon_alpha</div>
                            <div className="text-[10px] text-gray-600 font-mono tracking-wider">
                                UID: 0xA9F2...E1C4
                            </div>
                        </div>

                        {/* Rank Badge */}
                        <div className="px-3 py-1 border border-[#00E5FF]/50 bg-[#00E5FF]/10">
                            <div className="text-[9px] text-[#00E5FF] font-mono font-bold uppercase tracking-[0.15em]">
                                TIER 1
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. PERFORMANCE GRID */}
                <div className="p-4 border-b border-white/10">
                    <div className="grid grid-cols-2 gap-2">
                        {/* Net P&L */}
                        <div className="bg-white/5 border border-white/10 p-3 transition-all duration-150 hover:border-[#00E5FF]/30">
                            <div className="text-[9px] text-gray-600 font-mono uppercase tracking-[0.15em] mb-1">
                                NET P&L
                            </div>
                            <div className="text-lg font-bold font-mono text-[#00E5FF]">
                                +$24,567
                            </div>
                        </div>

                        {/* Win Rate */}
                        <div className="bg-white/5 border border-white/10 p-3 transition-all duration-150 hover:border-[#00E5FF]/30">
                            <div className="text-[9px] text-gray-600 font-mono uppercase tracking-[0.15em] mb-1">
                                WIN RATE
                            </div>
                            <div className="text-lg font-bold font-mono text-white">
                                68.4%
                            </div>
                        </div>

                        {/* Volume Traded */}
                        <div className="bg-white/5 border border-white/10 p-3 transition-all duration-150 hover:border-[#00E5FF]/30">
                            <div className="text-[9px] text-gray-600 font-mono uppercase tracking-[0.15em] mb-1">
                                VOLUME
                            </div>
                            <div className="text-lg font-bold font-mono text-white">
                                $2.4M
                            </div>
                        </div>

                        {/* Sharpe Ratio */}
                        <div className="bg-white/5 border border-white/10 p-3 transition-all duration-150 hover:border-[#00E5FF]/30">
                            <div className="text-[9px] text-gray-600 font-mono uppercase tracking-[0.15em] mb-1">
                                SHARPE
                            </div>
                            <div className="text-lg font-bold font-mono text-white">
                                2.87
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. QUICK ACTIONS (COMMAND LIST) */}
                <div className="p-2 border-b border-white/10">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-mono text-gray-400 hover:text-[#00E5FF] hover:translate-x-1 transition-all duration-150 border-l-2 border-transparent hover:border-[#00E5FF]">
                        <Key className="w-4 h-4" />
                        <span className="uppercase tracking-wider">API Keys</span>
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-mono text-gray-400 hover:text-[#00E5FF] hover:translate-x-1 transition-all duration-150 border-l-2 border-transparent hover:border-[#00E5FF]">
                        <FileText className="w-4 h-4" />
                        <span className="uppercase tracking-wider">Trading Logs</span>
                    </button>

                    <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-mono text-gray-400 hover:text-[#00E5FF] hover:translate-x-1 transition-all duration-150 border-l-2 border-transparent hover:border-[#00E5FF]">
                        <Settings className="w-4 h-4" />
                        <span className="uppercase tracking-wider">System Settings</span>
                    </button>

                    <div className="h-px bg-white/10 my-2" />

                    <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-mono text-gray-400 hover:text-[#FF006E] hover:translate-x-1 transition-all duration-150 border-l-2 border-transparent hover:border-[#FF006E]">
                        <LogOut className="w-4 h-4" />
                        <span className="uppercase tracking-wider">Disconnect</span>
                    </button>
                </div>

                {/* 4. FOOTER */}
                <div className="px-4 py-3 bg-white/5">
                    <div className="text-[10px] text-gray-700 font-mono tracking-wider">
                        // INITIATED: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </div>
                </div>
            </div>
        </>
    )
}
