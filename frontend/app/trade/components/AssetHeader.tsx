import { ChevronDown } from 'lucide-react'
import { Crypto, AVAILABLE_CRYPTOS } from '../types'
import { formatDisplayPrice, formatNumber, formatPrice, toPositiveNumber } from '../utils'
import { StatBox } from './UIComponents'
import { CryptoRow } from './CryptoRow'

interface AssetHeaderProps {
    selectedCrypto: Crypto
    showCryptoSelector: boolean
    setShowCryptoSelector: (show: boolean) => void
    searchTerm: string
    setSearchTerm: (term: string) => void
    favorites: Set<string>
    onSelectCrypto: (crypto: Crypto) => void
    onToggleFavorite: (symbol: string) => void
    currentPrice: number | null
    lastPrice: number | null
    high24h: number | null
    low24h: number | null
}

export function AssetHeader({
    selectedCrypto,
    showCryptoSelector,
    setShowCryptoSelector,
    searchTerm,
    setSearchTerm,
    favorites,
    onSelectCrypto,
    onToggleFavorite,
    currentPrice,
    lastPrice,
    high24h,
    low24h
}: AssetHeaderProps) {
    const safeCurrentPrice = toPositiveNumber(currentPrice) ?? toPositiveNumber(selectedCrypto.price)
    const safeLastPrice = toPositiveNumber(lastPrice) ?? safeCurrentPrice
    const priceIsUp = safeCurrentPrice !== null && safeLastPrice !== null
        ? safeCurrentPrice >= safeLastPrice
        : true
    const displayPrice = formatDisplayPrice(safeCurrentPrice)
    const displayHigh = high24h !== null ? formatPrice(high24h) : '--'
    const displayLow  = low24h !== null ? formatPrice(low24h) : '--'

    const filteredCryptos = AVAILABLE_CRYPTOS.filter(crypto =>
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="border-b border-white/10 px-6 py-4 shrink-0 bg-white/5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="relative">
                        <button
                            onClick={() => setShowCryptoSelector(!showCryptoSelector)}
                            className="flex items-center gap-4 group"
                        >
                            <div className="relative">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl font-bold grayscale-[0.3] group-hover:grayscale-0 transition-all duration-150"
                                    style={{ backgroundColor: selectedCrypto.color }}
                                >
                                    {selectedCrypto.icon}
                                </div>
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-4xl font-bold font-mono tracking-wider text-white">
                                        {selectedCrypto.symbol} / USD
                                    </h1>
                                    <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform duration-150 ${showCryptoSelector ? 'rotate-180' : ''}`} />
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-600 font-mono uppercase tracking-wider">PERPETUAL</span>
                                    <span className="text-gray-700">•</span>
                                    <span className="text-xs text-gray-600 font-mono">RANK #{selectedCrypto.rank}</span>
                                </div>
                            </div>
                        </button>

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
                                            className="w-full pl-8 pr-4 py-3 bg-transparent border-0 border-b border-white/10 outline-none focus:border-[#00E5FF] transition-all duration-150 text-sm font-mono text-white placeholder-gray-700"
                                        />
                                    </div>
                                </div>

                                <div className="p-3 border-b border-white/5 bg-white/5">
                                    <div className="text-xs text-gray-600 uppercase tracking-[0.15em] font-semibold font-mono mb-2 px-2">FAVORITES</div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {AVAILABLE_CRYPTOS.filter(c => favorites.has(c.symbol)).slice(0, 6).map(crypto => (
                                            <button
                                                key={crypto.symbol}
                                                onClick={() => { onSelectCrypto(crypto); setShowCryptoSelector(false); }}
                                                className={`flex items-center gap-2 p-2 transition-all duration-150 border ${selectedCrypto.symbol === crypto.symbol ? 'border-[#00E5FF] bg-[#00E5FF]/10' : 'border-white/10 hover:bg-white/5'
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
                                            onSelect={() => { onSelectCrypto(crypto); setShowCryptoSelector(false); }}
                                            isFavorite={favorites.has(crypto.symbol)}
                                            onToggleFavorite={() => onToggleFavorite(crypto.symbol)}
                                            formatPrice={formatDisplayPrice}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pl-8 border-l border-white/10">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xs text-gray-600 font-mono uppercase tracking-wider">MARK</span>
                            <span className={`text-5xl font-bold font-mono tabular-nums ${priceIsUp ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`} style={{ textShadow: priceIsUp ? '0 0 20px rgba(0,229,255,0.5)' : '0 0 20px rgba(255,0,110,0.5)' }}>
                                ${displayPrice}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <span className={`flex items-center gap-1 text-base font-bold font-mono ${selectedCrypto.change24h >= 0 ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`}>
                                {selectedCrypto.change24h >= 0 ? '▲' : '▼'}
                                {selectedCrypto.change24h >= 0 ? '+' : ''}{formatPrice(selectedCrypto.changeValue)}
                            </span>
                            <span className={`text-base font-bold font-mono ${selectedCrypto.change24h >= 0 ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`}>
                                {selectedCrypto.change24h >= 0 ? '+' : ''}{selectedCrypto.change24h.toFixed(2)}%
                            </span>
                            <span className="text-xs text-gray-700 font-mono">24H</span>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-8">
                    <StatBox label="24H VOL" value={formatNumber(selectedCrypto.volume24h)} />
                    <StatBox label="MKT CAP" value={formatNumber(selectedCrypto.marketCap)} />
                    <StatBox label="24H HIGH" value={`$${displayHigh}`} color="text-[#00E5FF]" />
                    <StatBox label="24H LOW" value={`$${displayLow}`} color="text-[#FF006E]" />
                </div>
            </div>
        </div>
    )
}
