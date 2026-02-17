import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/activity/recent
 * Returns recent account activity for the authenticated user
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

        // Get limit from query params
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')

        // TODO: Verify JWT token and extract user ID

        // Simulate database query delay
        await new Promise(resolve => setTimeout(resolve, 300))

        // Generate mock activity data
        const mockActivities = generateMockActivities(limit)

        return NextResponse.json(
            {
                activities: mockActivities,
                total: mockActivities.length
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Activity fetch error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Helper function to generate mock activity data
function generateMockActivities(count: number) {
    const activityTypes = [
        { type: 'LOGIN', category: 'SECURITY', details: 'Successful login from Chrome on Windows' },
        { type: 'LOGIN', category: 'SECURITY', details: 'Login attempt from Firefox on macOS' },
        { type: 'ORDER', category: 'FINANCIAL', details: 'BUY order executed: 0.1 BTC @ $88,077.50' },
        { type: 'ORDER', category: 'FINANCIAL', details: 'SELL order executed: 1.5 ETH @ $3,245.50' },
        { type: 'ORDER', category: 'FINANCIAL', details: 'BUY order placed: 10 SOL @ $142.30' },
        { type: 'DEPOSIT', category: 'FINANCIAL', details: 'Deposited $5,000 USDT to trading account' },
        { type: 'DEPOSIT', category: 'FINANCIAL', details: 'Deposited $10,000 USDT to trading account' },
        { type: 'WITHDRAW', category: 'FINANCIAL', details: 'Withdrew $2,500 USDT to external wallet' },
        { type: 'LOGIN', category: 'SECURITY', details: 'Successful login from Safari on iPhone' },
        { type: 'ORDER', category: 'FINANCIAL', details: 'BUY order executed: 5 BNB @ $445.20' },
    ]

    const activities = []
    const now = Date.now()

    for (let i = 0; i < Math.min(count, activityTypes.length); i++) {
        const activity = activityTypes[i % activityTypes.length]

        // Generate timestamp (random within last 7 days)
        const timestamp = new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()

        activities.push({
            id: `activity_${i}_${Date.now()}`,
            type: activity.type,
            category: activity.category,
            details: activity.details,
            timestamp
        })
    }

    // Sort by timestamp descending (newest first)
    return activities.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
}
