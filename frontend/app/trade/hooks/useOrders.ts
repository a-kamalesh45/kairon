import { useCallback } from 'react'
import { Crypto } from '../types'

interface UseOrdersProps {
    selectedCrypto: Crypto
    onOpenOrdersLoad: (orders: any[]) => void
    onOrderHistoryLoad: (history: any[]) => void
    onLoadingComplete: () => void
}

export function useOrders({
    selectedCrypto,
    onOpenOrdersLoad,
    onOrderHistoryLoad,
    onLoadingComplete
}: UseOrdersProps) {
    const loadOpenOrders = useCallback(async () => {
        try {
            const token = localStorage.getItem('kairon_token')
            const res = await fetch(`/api/orders/open?symbol=${selectedCrypto.symbol}USD`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (res.ok) {
                const data = await res.json()
                onOpenOrdersLoad(data.orders || [])
            }
        } catch (error) {
            console.error('Failed to load open orders:', error)
        }
    }, [selectedCrypto, onOpenOrdersLoad])

    const loadOrderHistory = useCallback(async () => {
        try {
            const token = localStorage.getItem('kairon_token')
            const res = await fetch(`/api/orders/history?symbol=${selectedCrypto.symbol}USD`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            if (res.ok) {
                const data = await res.json()
                onOrderHistoryLoad(data.orders || [])
            }
        } catch (error) {
            console.error('Failed to load order history:', error)
        } finally {
            onLoadingComplete()
        }
    }, [selectedCrypto, onOrderHistoryLoad, onLoadingComplete])

    const cancelOrder = useCallback(async (orderId: string) => {
        try {
            const token = localStorage.getItem('kairon_token')
            const res = await fetch('/api/orders/cancel', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId })
            })
            if (res.ok) {
                return true
            }
        } catch (error) {
            console.error('Failed to cancel order:', error)
        }
        return false
    }, [])

    const placeOrder = useCallback(async (symbol: string, side: 'buy' | 'sell', price: number, qty: number) => {
        try {
            await fetch('http://localhost:3001/api/trade/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol, side, price, qty })
            })
            return true
        } catch (e) {
            console.error('Failed to place order:', e)
        }
        return false
    }, [])

    return {
        loadOpenOrders,
        loadOrderHistory,
        cancelOrder,
        placeOrder
    }
}
