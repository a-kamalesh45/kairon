import { useEffect, useRef } from 'react'
import { createChart, ColorType, IChartApi, CrosshairMode, CandlestickSeries, Time, ISeriesApi } from 'lightweight-charts'
import { Crypto } from '../types'

interface ChartPanelProps {
    selectedCrypto: Crypto
    theme: 'dark' | 'light'
    mounted: boolean
    currentPrice: number
    lastPrice: number
    chartContainerRef: React.RefObject<HTMLDivElement>
    chartRef: React.MutableRefObject<IChartApi | null>
    candleSeriesRef: React.MutableRefObject<ISeriesApi<"Candlestick"> | null>
    currentPriceRef: React.MutableRefObject<number>
    currentCandle: React.MutableRefObject<{ time: Time; open: number; high: number; low: number; close: number } | null>
    chartPayloadInfo: { count: number; first?: number; last?: number } | null
    setChartPayloadInfo: (info: { count: number; first?: number; last?: number } | null) => void
    setCurrentPrice: (price: number) => void
    setLastPrice: (price: number) => void
}

export function ChartPanel({
    selectedCrypto,
    theme,
    mounted,
    currentPrice,
    lastPrice,
    chartContainerRef,
    chartRef,
    candleSeriesRef,
    currentPriceRef,
    currentCandle,
    chartPayloadInfo,
    setChartPayloadInfo,
    setCurrentPrice,
    setLastPrice
}: ChartPanelProps) {
    useEffect(() => {
        if (!mounted || !chartContainerRef.current) return;

        const bgColor = theme === 'dark' ? '#0d1117' : '#ffffff';
        const textColor = theme === 'dark' ? '#8b949e' : '#57606a';
        const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#d0d7de';

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
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#00E5FF',
            downColor: '#FF006E',
            borderVisible: false,
            wickUpColor: '#00E5FF',
            wickDownColor: '#FF006E',
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;

        let destroyed = false;

        const loadChartData = async () => {
            try {
                const res = await fetch(`/api/history?symbol=${selectedCrypto.symbol}`);
                const data = await res.json();

                if (Array.isArray(data) && data.length > 0) {
                    const normalizeCandles = (raw: any[]) => {
                        let arr: any[] = [];
                        if (Array.isArray(raw[0])) {
                            arr = raw.map(d => ({
                                time: Math.floor(Number(d[0]) / 1000),
                                open: parseFloat(d[1]),
                                high: parseFloat(d[2]),
                                low: parseFloat(d[3]),
                                close: parseFloat(d[4])
                            }));
                        } else {
                            arr = raw.map(d => ({
                                time: Math.floor(Number(d.time)),
                                open: Number(d.open),
                                high: Number(d.high),
                                low: Number(d.low),
                                close: Number(d.close)
                            }));
                        }

                        arr = arr.filter(x => Number.isFinite(x.time) && Number.isFinite(x.open) && Number.isFinite(x.high) && Number.isFinite(x.low) && Number.isFinite(x.close));
                        arr.sort((a, b) => a.time - b.time);

                        const dedup: typeof arr = [];
                        for (const c of arr) {
                            if (dedup.length && dedup[dedup.length - 1].time === c.time) {
                                dedup[dedup.length - 1] = c;
                            } else {
                                dedup.push(c);
                            }
                        }

                        return dedup;
                    }

                    const formattedData = normalizeCandles(data);

                    if (formattedData.length > 0) {
                        const lcData = formattedData.map(d => ({ time: d.time as Time, open: d.open, high: d.high, low: d.low, close: d.close }));

                        if (!destroyed) {
                            try {
                                candleSeries.setData(lcData);
                            } catch (err) {
                                console.error('candleSeries.setData failed', err, lcData.slice(0, 5));
                            }

                            setChartPayloadInfo({ count: lcData.length, first: lcData[0].time as number, last: lcData[lcData.length - 1].time as number });

                            const lastCandle = lcData[lcData.length - 1];
                            currentCandle.current = {
                                time: ((lastCandle.time as number) + 60) as Time,
                                open: lastCandle.close,
                                high: lastCandle.close,
                                low: lastCandle.close,
                                close: lastCandle.close
                            };
                            setCurrentPrice(lastCandle.close);
                            setLastPrice(lastCandle.open);
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to load chart data:", e);
            }
        };

        loadChartData();

        const ro = new ResizeObserver(entries => {
            if (!entries.length || destroyed) return;
            const { width, height } = entries[0].contentRect;
            chart.applyOptions({ width, height });
        });
        ro.observe(chartContainerRef.current);

        return () => {
            destroyed = true;
            chartRef.current = null;
            candleSeriesRef.current = null;
            try { ro.disconnect(); } catch (e) { /* ignore */ }
            chart.remove();
        };
    }, [theme, selectedCrypto.symbol, mounted]);

    return (
        <div className="flex-1 relative overflow-hidden border border-white/10 m-2">
            <div className="absolute top-0 left-0 right-0 z-10 px-4 py-2 border-b border-white/10 bg-black/80 backdrop-blur-sm">
                <span className="text-xs font-mono text-gray-500 tracking-wider">// PRICE ACTION [1H]</span>
            </div>

            <div className="w-full h-full flex-1 min-h-60 pt-10 relative">
                <div ref={chartContainerRef} className="absolute inset-0" />
                {chartPayloadInfo && (
                    <div className="absolute top-2 right-2 bg-black/60 border border-white/10 text-xs text-gray-300 px-2 py-1 rounded">
                        <div>candles: {chartPayloadInfo.count}</div>
                        <div className="text-gray-400">first: {new Date((chartPayloadInfo.first || 0) * 1000).toISOString()}</div>
                        <div className="text-gray-400">last: {new Date((chartPayloadInfo.last || 0) * 1000).toISOString()}</div>
                    </div>
                )}
            </div>

            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)'
            }} />
        </div>
    )
}
