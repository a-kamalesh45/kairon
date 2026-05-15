import { useState } from 'react'
import { Crypto, OrderBookItem, Trade } from '../types'
import { formatDisplayPrice, formatPrice, toPositiveNumber } from '../utils'
import { OrderBookRow } from './UIComponents'

interface OrderBookPanelProps {
    selectedCrypto: Crypto
    currentPrice: number | null
    lastPrice: number | null
    asks: OrderBookItem[]
    bids: OrderBookItem[]
    trades: Trade[]
}

export function OrderBookPanel({
    selectedCrypto,
    currentPrice,
    lastPrice,
    asks,
    bids,
    trades
}: OrderBookPanelProps) {
    const [tab, setTab] = useState<'book' | 'trades'>('book')
    const safeCurrentPrice = toPositiveNumber(currentPrice) ?? toPositiveNumber(selectedCrypto.price)
    const safeLastPrice = toPositiveNumber(lastPrice) ?? safeCurrentPrice
    const priceIsUp = safeCurrentPrice !== null && safeLastPrice !== null
        ? safeCurrentPrice >= safeLastPrice
        : true

    return (
        <div className="w-80 shrink-0 flex flex-col border-l border-white/10 bg-black">
            <div className="border-b border-white/10 px-4 py-3 bg-white/5">
                <h3 className="text-xs font-mono font-bold uppercase tracking-[0.15em] text-gray-500">L2 MARKET DEPTH</h3>
            </div>

            <div className="flex border-b border-white/10">
                <button
                    onClick={() => setTab('book')}
                    className={`flex-1 py-2 text-xs font-mono uppercase tracking-widest transition-all duration-150
                        ${tab === 'book' ? 'text-[#00E5FF] border-b-2 border-[#00E5FF]' : 'text-gray-600 hover:text-gray-400'}`}
                >
                    ORDER BOOK
                </button>
                <button
                    onClick={() => setTab('trades')}
                    className={`flex-1 py-2 text-xs font-mono uppercase tracking-widest transition-all duration-150
                        ${tab === 'trades' ? 'text-[#00E5FF] border-b-2 border-[#00E5FF]' : 'text-gray-600 hover:text-gray-400'}`}
                >
                    TRADES
                </button>
            </div>

            {tab === 'book' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="grid grid-cols-3 text-[10px] text-gray-600 px-3 py-2 border-b border-white/5 font-medium font-mono uppercase tracking-[0.15em]">
                        <span>PRICE</span>
                        <span className="text-right">SIZE</span>
                        <span className="text-right">TOTAL</span>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col justify-end px-1">
                        {asks.map((a, i) => (
                            <OrderBookRow key={i} price={a.price} qty={a.qty} type="ask" formatPrice={formatPrice} />
                        ))}
                    </div>

                    <div className="py-3 px-4 border-y border-white/10 flex items-center justify-between bg-white/5">
                        <span className={`text-xl font-bold font-mono ${priceIsUp ? 'text-[#00E5FF]' : 'text-[#FF006E]'}`}>
                            ${formatDisplayPrice(safeCurrentPrice)}
                        </span>
                        <span className="text-xs text-gray-700 font-mono uppercase tracking-wider">
                            SPREAD
                        </span>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col justify-start px-1">
                        {bids.map((b, i) => (
                            <OrderBookRow key={i} price={b.price} qty={b.qty} type="bid" formatPrice={formatPrice} />
                        ))}
                    </div>
                </div>
            )}

            {tab === 'trades' && (
                <div className="h-1/4 border-t border-white/10 flex flex-col">
                    <div className="grid grid-cols-3 text-[10px] text-gray-600 px-3 py-2 border-b border-white/5 font-medium font-mono uppercase tracking-[0.15em]">
                        <span>PRICE</span>
                        <span className="text-right">SIZE</span>
                        <span className="text-right">TIME</span>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {trades.map(t => (
                            <div key={t.id} className="grid grid-cols-3 px-3 py-1 text-xs hover:bg-white/5 transition-all duration-150 font-mono">
                                <span className={t.side === 'buy' ? 'text-[#00E5FF]' : 'text-[#FF006E]'}>
                                    {formatPrice(t.price)}
                                </span>
                                <span className="text-right text-gray-500">{t.qty.toFixed(4)}</span>
                                <span className="text-right text-gray-600 text-[10px]">{t.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
