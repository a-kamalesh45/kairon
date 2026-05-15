import { IChartApi, ISeriesApi, Time } from 'lightweight-charts'
import { Crypto } from '../types'

interface ChartPanelProps {
    selectedCrypto: Crypto
    theme: 'dark' | 'light'
    mounted: boolean
    currentPrice: number
    lastPrice: number
    chartContainerRef: React.RefObject<HTMLDivElement>
    chartRef: React.MutableRefObject<IChartApi | null>
    candleSeriesRef: React.MutableRefObject<ISeriesApi<"Candlestick"> | null>
    currentPriceRef: React.MutableRefObject<number>
    currentCandle: React.MutableRefObject<{ time: Time; open: number; high: number; low: number; close: number } | null>
    chartPayloadInfo: { count: number; first?: number; last?: number } | null
    setChartPayloadInfo: (info: { count: number; first?: number; last?: number } | null) => void
    setCurrentPrice: (price: number) => void
    setLastPrice: (price: number) => void
}

export function ChartPanel({
    chartContainerRef,
    chartPayloadInfo,
}: ChartPanelProps) {
    return (
        <div className="flex-1 relative overflow-hidden border border-white/10 m-2">
            <div className="absolute top-0 left-0 right-0 z-10 px-4 py-2 border-b border-white/10 bg-black/80 backdrop-blur-sm">
                <span className="text-xs font-mono text-gray-500 tracking-wider">// PRICE ACTION [1H]</span>
            </div>

            <div className="w-full h-full flex-1 min-h-60 pt-10 relative">
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
    )
}
