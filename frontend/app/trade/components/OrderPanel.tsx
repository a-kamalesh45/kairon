import { Zap, Wallet, BarChart3, TrendingUp, Activity } from 'lucide-react'
import { Crypto } from '../types'
import { formatPrice } from '../utils'
import { PortfolioStat } from './UIComponents'

interface OrderPanelProps {
    selectedCrypto: Crypto
    currentPrice: number
    orderQty: string
    orderPrice: string
    orderType: 'limit' | 'market'
    setOrderQty: (qty: string) => void
    setOrderPrice: (price: string) => void
    setOrderType: (type: 'limit' | 'market') => void
    placeOrder: (side: 'buy' | 'sell') => void
}

export function OrderPanel({
    selectedCrypto,
    currentPrice,
    orderQty,
    orderPrice,
    orderType,
    setOrderQty,
    setOrderPrice,
    setOrderType,
    placeOrder
}: OrderPanelProps) {
    return (
        <div className="h-56 shrink-0 border-t border-white/10 p-5 bg-white/5">
            <div className="h-full flex gap-8">
                <div className="w-80 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold font-mono flex items-center gap-2 text-white uppercase tracking-wider text-sm">
                            <Zap className="w-4 h-4 text-[#00E5FF]" />
                            PLACE ORDER
                        </h3>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setOrderType('limit')}
                                className={`px-3 py-1 text-xs font-medium font-mono uppercase tracking-wider transition-all duration-150 border ${orderType === 'limit' ? 'border-[#00E5FF] text-[#00E5FF]' : 'border-white/20 text-gray-500'
                                    }`}
                            >
                                LIMIT
                            </button>
                            <button
                                onClick={() => setOrderType('market')}
                                className={`px-3 py-1 text-xs font-medium font-mono uppercase tracking-wider transition-all duration-150 border ${orderType === 'market' ? 'border-[#00E5FF] text-[#00E5FF]' : 'border-white/20 text-gray-500'
                                    }`}
                            >
                                MARKET
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {orderType === 'limit' && (
                            <div>
                                <label className="text-[10px] text-gray-600 mb-2 block font-mono uppercase tracking-[0.15em]">PRICE</label>
                                <div className="relative">
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">$</span>
                                    <input
                                        type="number"
                                        placeholder={formatPrice(selectedCrypto.price)}
                                        value={orderPrice}
                                        onChange={e => setOrderPrice(e.target.value)}
                                        className="w-full pl-4 pr-2 pb-2 bg-transparent border-0 border-b border-white/20 text-white text-base outline-none focus:border-[#00E5FF] transition-all duration-150 font-mono placeholder-gray-700"
                                        style={{ boxShadow: 'none' }}
                                    />
                                </div>
                            </div>
                        )}
                        <div className={orderType === 'market' ? 'col-span-2' : ''}>
                            <label className="text-[10px] text-gray-600 mb-2 block font-mono uppercase tracking-[0.15em]">AMOUNT</label>
                            <div className="relative">
                                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">{selectedCrypto.symbol}</span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={orderQty}
                                    onChange={e => setOrderQty(e.target.value)}
                                    className="w-full pl-2 pr-14 pb-2 bg-transparent border-0 border-b border-white/20 text-white text-base outline-none focus:border-[#00E5FF] transition-all duration-150 font-mono placeholder-gray-700"
                                    style={{ boxShadow: 'none' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={() => placeOrder('buy')}
                            className="py-3 px-4 bg-[#00E5FF] text-black font-bold font-mono uppercase tracking-widest text-sm -skew-x-6 hover:shadow-[0_0_20px_rgba(0,229,255,0.6)] transition-all duration-150 active:scale-95"
                        >
                            <span className="skew-x-6 block">BUY</span>
                        </button>
                        <button
                            onClick={() => placeOrder('sell')}
                            className="py-3 px-4 border-2 border-[#FF006E] text-[#FF006E] hover:bg-[#FF006E] hover:text-black font-bold font-mono uppercase tracking-widest text-sm -skew-x-6 hover:shadow-[0_0_20px_rgba(255,0,110,0.6)] transition-all duration-150 active:scale-95"
                        >
                            <span className="skew-x-6 block">SELL</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-4 gap-6 pl-8 border-l border-white/10">
                    <PortfolioStat label="AVAILABLE BALANCE" value="$42,500.00" icon={<Wallet className="w-4 h-4" />} />
                    <PortfolioStat label="PORTFOLIO VALUE" value="$142,059.20" icon={<BarChart3 className="w-4 h-4" />} showSparkline />
                    <PortfolioStat label="UNREALIZED P&L" value="+$1,203.50" color="text-[#00E5FF]" icon={<TrendingUp className="w-4 h-4" />} />
                    <PortfolioStat label="TODAY'S P&L" value="+$458.32" color="text-[#00E5FF]" icon={<Activity className="w-4 h-4" />} />
                </div>
            </div>
        </div>
    )
}
