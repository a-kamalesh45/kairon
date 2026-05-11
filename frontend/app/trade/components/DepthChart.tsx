import { OrderBookItem } from '../types'

interface DepthChartProps {
    bids: { price: number; cumulative: number }[]
    asks: { price: number; cumulative: number }[]
}

export function DepthChart({ bids, asks }: DepthChartProps) {
    return (
        <div className="h-48 shrink-0 border-t border-white/10 bg-black/50">
            <div className="px-4 py-2 border-b border-white/10">
                <span className="text-xs font-mono text-gray-500 tracking-wider uppercase">// MARKET DEPTH</span>
            </div>
            <div className="h-full p-4">
                <svg className="w-full h-full" viewBox="0 0 800 120" preserveAspectRatio="none">
                    {bids.length > 0 && (
                        <path
                            d={`M 0 120 ${bids.map((d, i) => {
                                const x = (i / bids.length) * 400
                                const y = 120 - (d.cumulative / Math.max(...bids.map(b => b.cumulative)) * 100)
                                return `L ${x} ${y}`
                            }).join(' ')} L 400 120 Z`}
                            fill="url(#bidGradient)"
                            stroke="#00E5FF"
                            strokeWidth="1.5"
                            opacity="0.8"
                        />
                    )}
                    {asks.length > 0 && (
                        <path
                            d={`M 400 120 ${asks.map((d, i) => {
                                const x = 400 + (i / asks.length) * 400
                                const y = 120 - (d.cumulative / Math.max(...asks.map(a => a.cumulative)) * 100)
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
    )
}
