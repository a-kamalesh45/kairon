import { NextResponse } from 'next/server'

// Mock cancel order endpoint
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { orderId } = body

        if (!orderId) {
            return NextResponse.json(
                { error: 'Missing required field: orderId' },
                { status: 400 }
            )
        }

        return NextResponse.json({
            orderId,
            status: 'CANCELLED',
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        )
    }
}
