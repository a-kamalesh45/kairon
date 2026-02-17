import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/orders/history
 * Returns order history for the authenticated user
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
        await new Promise(resolve => setTimeout(resolve, 350))

        // Generate mock order history
        const mockOrders = generateMockOrderHistory(symbol || 'BTCUSD', 15)

        return NextResponse.json(
            {
                orders: mockOrders,
                total: mockOrders.length
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Order history error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Helper function to generate mock order history
function generateMockOrderHistory(symbol: string, count: number) {
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
        const priceOffset = (Math.random() - 0.5) * basePrice * 0.05 // +/- 5%
        const price = parseFloat((basePrice + priceOffset).toFixed(2))
        const quantity = parseFloat((Math.random() * 3).toFixed(4))
        const fee = parseFloat((price * quantity * 0.001).toFixed(2)) // 0.1% fee

        // Calculate realized PnL (random for mock data)
        const realizedPnL = parseFloat(((Math.random() - 0.45) * price * quantity * 0.08).toFixed(2))

        // Generate timestamp (random within last 30 days)
        const timestamp = new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()

        orders.push({
            id: `filled_${i}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            symbol,
            side,
            price,
            quantity,
            fee,
            realizedPnL,
            timestamp,
            status: 'filled'
        })
    }

    // Sort by timestamp descending (newest first)
    return orders.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
}
