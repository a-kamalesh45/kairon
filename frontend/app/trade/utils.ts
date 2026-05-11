export const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
}

export const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
}

export type CandlePoint = {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export const toPositiveNumber = (value: unknown) => {
    const num = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(num) || Number.isNaN(num) || num <= 0) return null
    return num
}

export const normalizeSymbol = (value: unknown) => {
    if (typeof value !== 'string') return ''
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export const isValidCandlePoint = (candle: CandlePoint) => {
    if (!Number.isFinite(candle.time) || Number.isNaN(candle.time) || candle.time <= 0) return false

    const open = toPositiveNumber(candle.open)
    const high = toPositiveNumber(candle.high)
    const low = toPositiveNumber(candle.low)
    const close = toPositiveNumber(candle.close)

    if (open === null || high === null || low === null || close === null) return false

    const maxOC = Math.max(open, close)
    const minOC = Math.min(open, close)
    if (high < maxOC || low > minOC) return false

    return true
}

export const normalizeHistoryCandles = (raw: unknown) => {
    if (!Array.isArray(raw)) return [] as CandlePoint[]

    const parsed: CandlePoint[] = []

    for (const entry of raw) {
        let timeRaw: unknown
        let openRaw: unknown
        let highRaw: unknown
        let lowRaw: unknown
        let closeRaw: unknown

        if (Array.isArray(entry)) {
            timeRaw = entry[0]
            openRaw = entry[1]
            highRaw = entry[2]
            lowRaw = entry[3]
            closeRaw = entry[4]
        } else if (entry && typeof entry === 'object') {
            const candle = entry as { time?: unknown; open?: unknown; high?: unknown; low?: unknown; close?: unknown }
            timeRaw = candle.time
            openRaw = candle.open
            highRaw = candle.high
            lowRaw = candle.low
            closeRaw = candle.close
        } else {
            continue
        }

        const timeNum = typeof timeRaw === 'number' ? timeRaw : Number(timeRaw)
        if (!Number.isFinite(timeNum) || Number.isNaN(timeNum) || timeNum <= 0) continue

        const timeSeconds = timeNum > 1e12 ? Math.floor(timeNum / 1000) : Math.floor(timeNum)

        const open = toPositiveNumber(openRaw)
        const high = toPositiveNumber(highRaw)
        const low = toPositiveNumber(lowRaw)
        const close = toPositiveNumber(closeRaw)

        if (open === null || high === null || low === null || close === null) continue

        const candle: CandlePoint = { time: timeSeconds, open, high, low, close }
        if (!isValidCandlePoint(candle)) continue

        parsed.push(candle)
    }

    parsed.sort((a, b) => a.time - b.time)

    const deduped: CandlePoint[] = []
    for (const candle of parsed) {
        if (deduped.length && deduped[deduped.length - 1].time === candle.time) {
            deduped[deduped.length - 1] = candle
        } else {
            deduped.push(candle)
        }
    }

    return deduped
}
