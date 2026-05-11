import { useEffect, useRef } from 'react'
import { Time, ISeriesApi } from 'lightweight-charts'
import { Trade, OrderBookItem } from '../types'

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
                if (data.type === 'trade') {
                    const { price, qty, side, time: timeStr } = data
                    const numPrice = parseFloat(price)
                    const numQty = parseFloat(qty)

                    onPriceUpdate(numPrice, currentPriceRef.current)
                    currentPriceRef.current = numPrice

                    const nowSeconds = Math.floor(Date.now() / 1000)
                    const candleTime = Math.floor(nowSeconds / 60) * 60

                    if (!currentCandle.current) return

                    if ((candleTime as Time) > (currentCandle.current.time as Time)) {
                        const prevClose = currentCandle.current.close
                        currentCandle.current = {
                            time: candleTime as Time,
                            open: prevClose,
                            high: Math.max(prevClose, numPrice),
                            low: Math.min(prevClose, numPrice),
                            close: numPrice
                        }
                    } else {
                        currentCandle.current.close = numPrice
                        currentCandle.current.high = Math.max(currentCandle.current.high, numPrice)
                        currentCandle.current.low = Math.min(currentCandle.current.low, numPrice)
                    }

                    candleSeriesRef.current?.update(currentCandle.current)

                    onTrade({
                        id: Math.random().toString(36).substr(2, 5),
                        price: numPrice,
                        qty: numQty,
                        side,
                        time: timeStr
                    })

                    onOrderBook(numPrice)
                }
            } catch (e) {
                console.error(e)
            }
        }

        return () => {
            ws.current?.close()
        }
    }, [])

    return { ws, connectionStatus }
}
