import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 */
export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        // Validate request body
        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required' },
                { status: 400 }
            )
        }

        // TODO: Replace with actual authentication logic
        // This is a mock implementation for demo purposes

        // Simulate database lookup delay
        await new Promise(resolve => setTimeout(resolve, 500))

        // Mock validation (replace with real DB query + bcrypt comparison)
        if (email === 'demo@kairon.com' && password === 'demo1234') {
            // Generate mock JWT token (replace with actual JWT signing)
            const token = Buffer.from(
                JSON.stringify({
                    userId: '123',
                    email: email,
                    timestamp: Date.now()
                })
            ).toString('base64')

            return NextResponse.json(
                {
                    token,
                    user: {
                        email,
                        id: '123'
                    },
                    message: 'Login successful'
                },
                { status: 200 }
            )
        } else {
            return NextResponse.json(
                { message: 'Invalid email or password' },
                { status: 401 }
            )
        }
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
