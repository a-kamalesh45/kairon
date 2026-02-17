import { NextResponse } from 'next/server'

// Mock order placement endpoint
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { symbol, side, qty } = body

        // Validate request
        if (!symbol || !side || !qty) {
            return NextResponse.json(
                { error: 'Missing required fields: symbol, side, qty' },
                { status: 400 }
            )
        }

        // Mock successful order response
        return NextResponse.json({
            orderId: `ORD-${Date.now()}`,
            symbol,
            side,
            qty,
            status: 'FILLED',
            price: side === 'BUY' ? 88077.50 : 88076.50,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        )
    }
}
