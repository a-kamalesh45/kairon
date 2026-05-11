import { useCallback, useMemo } from 'react'
import { OrderBookItem } from '../types'

interface UseOrderBookProps {
    bids: OrderBookItem[]
    asks: OrderBookItem[]
}

export function useOrderBook({ bids, asks }: UseOrderBookProps) {
    const generateOrderBook = useCallback((centerPrice: number) => {
        const newAsks: OrderBookItem[] = []
        const newBids: OrderBookItem[] = []
        const spread = centerPrice * 0.0001

        for (let i = 1; i <= 12; i++) {
            newAsks.push({ price: centerPrice + (i * spread), qty: Math.random() * 1.5, total: 0 })
            newBids.push({ price: centerPrice - (i * spread), qty: Math.random() * 1.5, total: 0 })
        }

        return { asks: newAsks.reverse(), bids: newBids }
    }, [])

    const calculateDepth = useMemo(() => {
        const sortedBids = [...bids].sort((a, b) => b.price - a.price)
        const sortedAsks = [...asks].sort((a, b) => a.price - b.price)

        let cumulativeBids: { price: number; cumulative: number }[] = []
        let cumulative = 0
        for (const bid of sortedBids) {
            cumulative += bid.qty
            cumulativeBids.push({ price: bid.price, cumulative })
        }

        let cumulativeAsks: { price: number; cumulative: number }[] = []
        cumulative = 0
        for (const ask of sortedAsks) {
            cumulative += ask.qty
            cumulativeAsks.push({ price: ask.price, cumulative })
        }

        return { bids: cumulativeBids, asks: cumulativeAsks }
    }, [bids, asks])

    return {
        generateOrderBook,
        calculateDepth
    }
}
