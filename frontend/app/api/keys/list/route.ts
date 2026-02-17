import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/keys/list
 * Returns all API keys for the authenticated user
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

        // TODO: Verify JWT token and extract user ID
        // For now, returning mock data

        // Simulate database query delay
        await new Promise(resolve => setTimeout(resolve, 300))

        // Mock API keys data
        const mockKeys = [
            {
                id: '1',
                keyId: 'ak_live_x8s9****',
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active'
            },
            {
                id: '2',
                keyId: 'ak_live_k2m4****',
                createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'revoked'
            }
        ]

        return NextResponse.json(
            { keys: mockKeys },
            { status: 200 }
        )
    } catch (error) {
        console.error('List keys error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
