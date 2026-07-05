import { useMemo } from 'react'
import { OrderBookItem } from '../types'

interface UseOrderBookProps {
    bids: OrderBookItem[]
    asks: OrderBookItem[]
}

export function useOrderBook({ bids, asks }: UseOrderBookProps) {
    
    // 🚀 THE FIX: calculate running totals using the REAL data
    const processedOrderBook = useMemo(() => {
        let currentBidTotal = 0;
        const processedBids = bids.map(bid => {
            currentBidTotal += bid.qty;
            return { ...bid, total: currentBidTotal };
        });

        let currentAskTotal = 0;
        const processedAsks = asks.map(ask => {
            currentAskTotal += ask.qty;
            return { ...ask, total: currentAskTotal };
        });

        return { bids: processedBids, asks: processedAsks };
    }, [bids, asks]);

    // Calculate cumulative depth for the visual Area Chart
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
        processedOrderBook,
        calculateDepth
    }
}