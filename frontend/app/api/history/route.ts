import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol') ?? 'BTC'
  // 🚀 THE FIX: Dynamically fetch the requested interval, default to 1m
  const interval = req.nextUrl.searchParams.get('interval') ?? '1m' 
  
  const pair = `${symbol.toUpperCase()}USDT`
  const url = `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=500`

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`[history] Binance ${res.status}:`, text)
      return NextResponse.json({ error: `Binance error ${res.status}`, detail: text }, { status: 502 })
    }

    const data = await res.json()

    if (!Array.isArray(data)) {
      console.error('[history] unexpected Binance response:', data)
      return NextResponse.json({ error: 'Unexpected response', detail: data }, { status: 502 })
    }

    const candles = data.map((d: any[]) => ({
      time:  Math.floor(Number(d[0]) / 1000),
      open:  parseFloat(d[1]),
      high:  parseFloat(d[2]),
      low:   parseFloat(d[3]),
      close: parseFloat(d[4]),
    }))

    return NextResponse.json(candles)

  } catch (e: any) {
    console.error('[history] threw:', e?.message)
    return NextResponse.json({ error: 'Internal error', detail: e?.message }, { status: 500 })
  }
}