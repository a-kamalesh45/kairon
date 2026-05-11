interface OrdersHistoryProps {
    ordersTab: 'OPEN' | 'HISTORY'
    setOrdersTab: (tab: 'OPEN' | 'HISTORY') => void
    loadingOrders: boolean
    openOrders: any[]
    orderHistory: any[]
    cancelOrder: (orderId: string) => void
}

export function OrdersHistory({
    ordersTab,
    setOrdersTab,
    loadingOrders,
    openOrders,
    orderHistory,
    cancelOrder
}: OrdersHistoryProps) {
    return (
        <div className="border-t border-white/10 bg-[#0A0B0D]">
            <div className="flex gap-0 border-b border-white/10 px-6">
                <button
                    onClick={() => setOrdersTab('OPEN')}
                    className={`px-6 py-3 text-xs font-mono uppercase tracking-widest transition-all duration-200 ${ordersTab === 'OPEN'
                            ? 'text-[#00E5FF] border-b-2 border-[#00E5FF]'
                            : 'text-gray-600 hover:text-gray-400'
                        }`}
                >
                    Open Orders
                </button>
                <button
                    onClick={() => setOrdersTab('HISTORY')}
                    className={`px-6 py-3 text-xs font-mono uppercase tracking-widest transition-all duration-200 ${ordersTab === 'HISTORY'
                            ? 'text-[#00E5FF] border-b-2 border-[#00E5FF]'
                            : 'text-gray-600 hover:text-gray-400'
                        }`}
                >
                    Order History
                </button>
            </div>

            <div className="p-6">
                {ordersTab === 'OPEN' ? (
                    loadingOrders ? (
                        <div className="text-center py-8 text-gray-600 font-mono text-sm">
                            Loading orders...
                        </div>
                    ) : openOrders.length === 0 ? (
                        <div className="text-center py-12 text-gray-600 font-mono uppercase tracking-widest text-sm">
                            NO ACTIVE ORDERS
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full font-mono text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Order ID</th>
                                        <th className="text-center py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Side</th>
                                        <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Price</th>
                                        <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Quantity</th>
                                        <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Filled</th>
                                        <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Timestamp</th>
                                        <th className="text-center py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {openOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-4 px-4 text-gray-400">
                                                {order.id.substring(0, 8)}...
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest -skew-x-6 ${order.side === 'buy'
                                                        ? 'text-[#00E5FF] border border-[#00E5FF]/30 bg-[#00E5FF]/10'
                                                        : 'text-[#FF006E] border border-[#FF006E]/30 bg-[#FF006E]/10'
                                                    }`}>
                                                    <span className="skew-x-6">{order.side}</span>
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right text-white">
                                                ${order.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 px-4 text-right text-gray-400">
                                                {order.quantity.toFixed(4)}
                                            </td>
                                            <td className="py-4 px-4 text-right text-gray-400">
                                                {order.filled.toFixed(1)}%
                                            </td>
                                            <td className="py-4 px-4 text-gray-400">
                                                {new Date(order.timestamp).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    onClick={() => cancelOrder(order.id)}
                                                    className="py-1 px-3 border border-[#FF006E] text-[#FF006E] hover:bg-[#FF006E] hover:text-black font-bold font-mono uppercase tracking-widest text-xs -skew-x-6 hover:shadow-[0_0_15px_rgba(255,0,110,0.4)] transition-all duration-150"
                                                >
                                                    <span className="skew-x-6 block">CANCEL</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    loadingOrders ? (
                        <div className="text-center py-8 text-gray-600 font-mono text-sm">
                            Loading history...
                        </div>
                    ) : orderHistory.length === 0 ? (
                        <div className="text-center py-12 text-gray-600 font-mono uppercase tracking-widest text-sm">
                            NO ORDER HISTORY
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full font-mono text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Timestamp</th>
                                        <th className="text-center py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Side</th>
                                        <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Price</th>
                                        <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Quantity</th>
                                        <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Fee</th>
                                        <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-widest">Realized PnL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderHistory.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-4 px-4 text-gray-400">
                                                {new Date(order.timestamp).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest -skew-x-6 ${order.side === 'buy'
                                                        ? 'text-[#00E5FF] border border-[#00E5FF]/30 bg-[#00E5FF]/10'
                                                        : 'text-[#FF006E] border border-[#FF006E]/30 bg-[#FF006E]/10'
                                                    }`}>
                                                    <span className="skew-x-6">{order.side}</span>
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right text-white">
                                                ${order.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 px-4 text-right text-gray-400">
                                                {order.quantity.toFixed(4)}
                                            </td>
                                            <td className="py-4 px-4 text-right text-gray-500">
                                                ${order.fee.toFixed(2)}
                                            </td>
                                            <td className={`py-4 px-4 text-right font-bold ${order.realizedPnL >= 0 ? 'text-[#00E5FF]' : 'text-[#FF006E]'
                                                }`}>
                                                {order.realizedPnL >= 0 ? '+' : ''}${Math.abs(order.realizedPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}
