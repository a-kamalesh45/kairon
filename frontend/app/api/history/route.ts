import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // 1. Get the symbol from the URL (e.g., ?symbol=BTC)
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTC';
    
    // 2. Fetch Real History from Binance (Public API)
    // We append 'USDT' because your app defaults to USDT pairs
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}USDT&interval=1m&limit=1000`);
    
    if (!res.ok) throw new Error('Failed to fetch from Binance');
    
    const data = await res.json();

    // 3. Format it for Lightweight Charts
    // Binance format: [Time, Open, High, Low, Close, Volume, ...]
    // Chart format: { time, open, high, low, close }
    const formatted = data.map((d: any) => ({
      time: d[0] / 1000, // Convert ms to seconds
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}