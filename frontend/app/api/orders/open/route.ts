import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/orders/open
 * Returns all open orders for the authenticated user
 */
export async function GET(request: NextRequest) {
    try {
        // Extract token from Authorization header
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get symbol from query params
        const { searchParams } = new URL(request.url)
        const symbol = searchParams.get('symbol')

        // TODO: Verify JWT token and extract user ID

        // Simulate database query delay
        await new Promise(resolve => setTimeout(resolve, 300))

        // Generate mock open orders
        const mockOrders = generateMockOpenOrders(symbol || 'BTCUSD', 5)

        return NextResponse.json(
            {
                orders: mockOrders,
                total: mockOrders.length
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Open orders error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Helper function to generate mock open orders
function generateMockOpenOrders(symbol: string, count: number) {
    const orders = []
    const sides = ['buy', 'sell']
    const now = Date.now()

    // Get base price for symbol
    const basePrices: Record<string, number> = {
        'BTCUSD': 88000,
        'ETHUSD': 3200,
        'SOLUSD': 140,
        'BNBUSD': 440,
    }

    const basePrice = basePrices[symbol] || 100

    for (let i = 0; i < count; i++) {
        const side = sides[Math.floor(Math.random() * sides.length)]
        const priceOffset = (Math.random() - 0.5) * basePrice * 0.02 // +/- 2%
        const price = parseFloat((basePrice + priceOffset).toFixed(2))
        const quantity = parseFloat((Math.random() * 2).toFixed(4))
        const filled = parseFloat((Math.random() * 30).toFixed(1)) // 0-30% filled

        // Generate timestamp (random within last 24 hours)
        const timestamp = new Date(now - Math.random() * 24 * 60 * 60 * 1000).toISOString()

        orders.push({
            id: `order_${i}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            symbol,
            side,
            price,
            quantity,
            filled,
            timestamp,
            status: 'open'
        })
    }

    // Sort by timestamp descending (newest first)
    return orders.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
}
