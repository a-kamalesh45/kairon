import { Crypto } from '../types'
import { Star } from 'lucide-react'

export function CryptoRow({ crypto, selected, onSelect, isFavorite, onToggleFavorite, formatPrice }: {
    crypto: Crypto;
    selected: boolean;
    onSelect: () => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    formatPrice: (n: number) => string;
}) {
    return (
        <div
            className={`flex items-center justify-between px-5 py-3 border-b border-[#1A1D2A] transition-all duration-150 cursor-pointer group ${selected ? 'border-l-2 border-l-[#00E5FF] bg-[#00E5FF]/5' : 'hover:bg-[#1A1D2A]/30 hover:border-l-2 hover:border-l-[#00E5FF]'
                }`}
            onClick={onSelect}
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg grayscale-[0.3] group-hover:grayscale-0 transition-all duration-150" style={{ backgroundColor: crypto.color }}>
                    {crypto.icon}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#E6E6E6] font-mono">{crypto.symbol}</span>
                        <span className="text-xs text-[#8D8F98] font-mono">#{crypto.rank}</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-mono text-[#8D8F98] opacity-70">{crypto.name}</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <div className="font-medium text-[#E6E6E6] font-mono">${formatPrice(crypto.price)}</div>
                    <div className={`text-xs font-mono ${crypto.change24h >= 0 ? 'text-[#00E5FF]' : 'text-[#FF007A]'}`}>
                        {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                    </div>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                    className={`p-1 transition-all duration-150 ${isFavorite ? 'text-[#00E5FF]' : 'text-[#8D8F98] opacity-0 group-hover:opacity-100'}`}
                >
                    <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
            </div>
        </div>
    )
}
