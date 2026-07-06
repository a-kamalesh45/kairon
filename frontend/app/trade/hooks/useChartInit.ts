import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi, CrosshairMode, CandlestickSeries, Time, ISeriesApi } from 'lightweight-charts'
import { Crypto } from '../types'

interface UseChartInitProps {
    theme: 'dark' | 'light'
    mounted: boolean
    selectedCrypto: Crypto
    onPriceUpdate: (current: number, last: number) => void
}

export function useChartInit({ theme, mounted, selectedCrypto, onPriceUpdate }: UseChartInitProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
    const currentCandle = useRef<{ time: Time; open: number; high: number; low: number; close: number } | null>(null)
    const [chartPayloadInfo, setChartPayloadInfo] = useState<{ count: number; first?: number; last?: number } | null>(null)

    useEffect(() => {
        if (!mounted || !chartContainerRef.current) return

        const bgColor = theme === 'dark' ? '#0d1117' : '#ffffff'
        const textColor = theme === 'dark' ? '#8b949e' : '#57606a'
        const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#d0d7de'

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            layout: {
                background: { type: ColorType.Solid, color: bgColor },
                textColor: textColor,
            },
            grid: {
                vertLines: { color: gridColor },
                horzLines: { color: gridColor },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: gridColor,
            },
            rightPriceScale: {
                borderColor: gridColor,
                visible: true,
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: { color: 'rgba(0, 229, 255, 0.5)', width: 1, style: 3 },
                horzLine: { color: 'rgba(0, 229, 255, 0.5)', width: 1, style: 3 },
            },
        })

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#00E5FF',
            downColor: '#FF006E',
            borderVisible: false,
            wickUpColor: '#00E5FF',
            wickDownColor: '#FF006E',
        })

        chartRef.current = chart
        candleSeriesRef.current = candleSeries

        let destroyed = false

        const loadChartData = async () => {
            try {
                const res = await fetch(`/api/history?symbol=${selectedCrypto.symbol}`)
                const data = await res.json()

                if (Array.isArray(data) && data.length > 0) {
                    const normalizeCandles = (raw: any[]) => {
                        let arr: any[] = []
                        if (Array.isArray(raw[0])) {
                            arr = raw.map(d => ({
                                time: Math.floor(Number(d[0]) / 1000),
                                open: parseFloat(d[1]),
                                high: parseFloat(d[2]),
                                low: parseFloat(d[3]),
                                close: parseFloat(d[4])
                            }))
                        } else {
                            arr = raw.map(d => ({
                                time: Number(d.time) > 1e12 ? Math.floor(Number(d.time) / 1000) : Math.floor(Number(d.time)),
                                open: Number(d.open),
                                high: Number(d.high),
                                low: Number(d.low),
                                close: Number(d.close)
                            }))
                        }

                        arr = arr.filter(x => Number.isFinite(x.time) && Number.isFinite(x.open) && Number.isFinite(x.high) && Number.isFinite(x.low) && Number.isFinite(x.close))
                        arr.sort((a, b) => a.time - b.time)

                        const dedup: typeof arr = []
                        for (const c of arr) {
                            if (dedup.length && dedup[dedup.length - 1].time === c.time) {
                                dedup[dedup.length - 1] = c
                            } else {
                                dedup.push(c)
                            }
                        }

                        return dedup
                    }

                    const formattedData = normalizeCandles(data)

                    if (formattedData.length > 0) {
                        const lcData = formattedData.map(d => ({ time: d.time as Time, open: d.open, high: d.high, low: d.low, close: d.close }))

                        if (!destroyed) {
                            try {
                                candleSeries.setData(lcData)
                            } catch (err) {
                                console.error('candleSeries.setData failed', err)
                            }

                            setChartPayloadInfo({ count: lcData.length, first: lcData[0].time as number, last: lcData[lcData.length - 1].time as number })

                            const lastCandle = lcData[lcData.length - 1]
                            currentCandle.current = {
                                // 🚀 THE FIX: Use Binance's exact server time, completely ignoring Date.now()
                                time: lastCandle.time,

                                // 🚀 BONUS FIX: Use the actual historical OHLC values, not just flat closes
                                open: lastCandle.open,
                                high: lastCandle.high,
                                low: lastCandle.low,
                                close: lastCandle.close
                            }
                            onPriceUpdate(lastCandle.close, lastCandle.open)
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to load chart data:', e)
            }
        }

        loadChartData()

        const ro = new ResizeObserver(entries => {
            if (!entries.length || destroyed) return
            const { width, height } = entries[0].contentRect
            chart.applyOptions({ width, height })
        })
        ro.observe(chartContainerRef.current)

        return () => {
            destroyed = true
            chartRef.current = null
            candleSeriesRef.current = null
            try { ro.disconnect() } catch (e) { /* ignore */ }
            chart.remove()
        }
    }, [theme, selectedCrypto.symbol, mounted])

    return {
        chartContainerRef,
        chartRef,
        candleSeriesRef,
        currentCandle,
        chartPayloadInfo,
        setChartPayloadInfo
    }
}
