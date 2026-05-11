export function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div className="text-right">
            <div className="text-[10px] text-[#8D8F98] mb-1 font-mono uppercase tracking-[0.15em]">{label}</div>
            <div className={`text-sm font-semibold font-mono ${color || 'text-[#E6E6E6]'}`}>{value}</div>
        </div>
    )
}

export function PortfolioStat({ label, value, color, icon, showSparkline }: { label: string; value: string; color?: string; icon: React.ReactNode; showSparkline?: boolean }) {
    return (
        <div>
            <div className="flex items-center gap-2 text-[#8D8F98] mb-2">
                <div className="text-[#8D8F98]">
                    {icon}
                </div>
                <span className="text-[10px] font-medium font-mono uppercase tracking-[0.15em]">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className={`text-2xl font-bold font-mono ${color || 'text-[#E6E6E6]'}`}>{value}</div>
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

export function OrderBookRow({ price, qty, type, formatPrice }: { price: number; qty: number; type: 'bid' | 'ask'; formatPrice: (n: number) => string }) {
    return (
        <div className="grid grid-cols-3 px-3 py-0.5 text-[11px] hover:bg-[#1A1D2A]/30 cursor-pointer relative transition-all duration-150">
            {/* Depth Bar - Right to Left Gradient */}
            <div
                className="absolute top-0 right-0 bottom-0 opacity-[0.12]"
                style={{
                    width: `${Math.min(qty * 30, 100)}%`,
                    background: type === 'bid'
                        ? 'linear-gradient(to left, #00E5FF, transparent)'
                        : 'linear-gradient(to left, #FF007A, transparent)'
                }}
            />
            <span className={`relative font-bold font-mono ${type === 'bid' ? 'text-[#00E5FF]' : 'text-[#FF007A]'}`}>
                {formatPrice(price)}
            </span>
            <span className="relative text-right text-[#8D8F98] font-mono">{qty.toFixed(4)}</span>
            <span className="relative text-right text-[#E6E6E6] font-mono">{(price * qty).toFixed(0)}</span>
        </div>
    )
}
