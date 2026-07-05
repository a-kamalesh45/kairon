import { useEffect, useRef } from 'react'
import { Time, ISeriesApi } from 'lightweight-charts'
import { Trade } from '../types'

interface UseWebSocketProps {
    candleSeriesRef: React.MutableRefObject<ISeriesApi<"Candlestick"> | null>
    currentCandle: React.MutableRefObject<{ time: Time; open: number; high: number; low: number; close: number } | null>
    currentPriceRef: React.MutableRefObject<number>
    onTrade: (trade: Trade) => void
    onOrderBook: (centerPrice: number) => void
    onPriceUpdate: (current: number, last: number) => void
}

export function useWebSocket({
    candleSeriesRef,
    currentCandle,
    currentPriceRef,
    onTrade,
    onOrderBook,
    onPriceUpdate
}: UseWebSocketProps) {
    const ws = useRef<WebSocket | null>(null)
    const connectionStatus = useRef<"connected" | "disconnected">("disconnected")

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:3001')

        ws.current.onopen = () => {
            connectionStatus.current = "connected"
        }

        ws.current.onclose = () => {
            connectionStatus.current = "disconnected"
        }

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                
                // We handle both normal execution JSONs and standard ticks
                if (data.type === 'trade' || (data.price && data.timestamp)) {
                    const numPrice = Number(data.price)
                    const numQty = Number(data.qty)
                    
                    // 1. Normalize timestamp strictly to Unix Seconds
                    const unixSeconds = data.timestamp > 10000000000 
                        ? Math.floor(data.timestamp / 1000) 
                        : data.timestamp
                    
                    // 2. Lock the time to the 60-second floor (perfect Binance 1m match)
                    const candleTime = (Math.floor(unixSeconds / 60) * 60) as Time

                    currentPriceRef.current = numPrice
                    onPriceUpdate(numPrice, numPrice)

                    if (!currentCandle.current) return

                    // 3. True OHLC Aggregation Logic
                    if (candleTime > currentCandle.current.time) {
                        // Start a brand new 1m candle
                        const prevClose = currentCandle.current.close
                        currentCandle.current = {
                            time: candleTime,
                            open: prevClose,
                            high: Math.max(prevClose, numPrice),
                            low: Math.min(prevClose, numPrice),
                            close: numPrice
                        }
                    } else if (candleTime === currentCandle.current.time) {
                        // Mutate the currently forming 1m candle
                        currentCandle.current.close = numPrice
                        currentCandle.current.high = Math.max(currentCandle.current.high, numPrice)
                        currentCandle.current.low = Math.min(currentCandle.current.low, numPrice)
                    }

                    // 4. Update the chart smoothly
                    candleSeriesRef.current?.update(currentCandle.current)

                    // 5. Fire side-effects
                    onTrade({
                        id: data.id || Math.random().toString(36).substr(2, 5),
                        price: numPrice,
                        qty: numQty,
                        side: data.side,
                        time: new Date(unixSeconds * 1000).toLocaleTimeString()
                    })

                    onOrderBook(numPrice)
                }
            } catch (e) {
                console.error("WebSocket Parsing Error:", e)
            }
        }

        return () => {
            ws.current?.close()
        }
    }, [candleSeriesRef, currentCandle, currentPriceRef, onTrade, onOrderBook, onPriceUpdate])

    return { ws, connectionStatus }
}