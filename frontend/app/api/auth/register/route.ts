import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/register
 * Creates new user account and returns JWT token
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

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: 'Invalid email format' },
                { status: 400 }
            )
        }

        // Validate password length
        if (password.length < 8) {
            return NextResponse.json(
                { message: 'Password must be at least 8 characters' },
                { status: 400 }
            )
        }

        // TODO: Replace with actual user creation logic
        // This is a mock implementation for demo purposes

        // Simulate database operation delay
        await new Promise(resolve => setTimeout(resolve, 700))

        // Mock: Check if email already exists (replace with real DB query)
        const existingEmails = ['existing@kairon.com', 'demo@kairon.com']
        if (existingEmails.includes(email.toLowerCase())) {
            return NextResponse.json(
                { message: 'Email already registered' },
                { status: 409 }
            )
        }

        // Mock: Create user (replace with actual DB insert + bcrypt hash)
        // In production: Hash password with bcrypt before storing

        // Generate mock JWT token (replace with actual JWT signing)
        const token = Buffer.from(
            JSON.stringify({
                userId: Date.now().toString(),
                email: email,
                timestamp: Date.now()
            })
        ).toString('base64')

        return NextResponse.json(
            {
                token,
                user: {
                    email,
                    id: Date.now().toString()
                },
                message: 'Registration successful'
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
