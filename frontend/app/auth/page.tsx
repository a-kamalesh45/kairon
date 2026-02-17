"use client"

import React, { useState } from "react"
import { Terminal, ArrowRight } from "lucide-react"
import Link from "next/link"

type AuthMode = 'login' | 'register'

interface FormData {
    email: string
    password: string
    confirmPassword: string
}

interface FormErrors {
    email: string
    password: string
    confirmPassword: string
    apiError: string
}

export default function AuthPage() {
    const [mode, setMode] = useState<AuthMode>('login')
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState<FormErrors>({
        email: '',
        password: '',
        confirmPassword: '',
        apiError: ''
    })
    const [loading, setLoading] = useState(false)

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    // Validate individual fields
    const validateEmail = (email: string): boolean => {
        if (!email) {
            setErrors(prev => ({ ...prev, email: 'Email is required' }))
            return false
        }
        if (!emailRegex.test(email)) {
            setErrors(prev => ({ ...prev, email: 'Invalid email format' }))
            return false
        }
        setErrors(prev => ({ ...prev, email: '' }))
        return true
    }

    const validatePassword = (password: string): boolean => {
        if (!password) {
            setErrors(prev => ({ ...prev, password: 'Password is required' }))
            return false
        }
        if (password.length < 8) {
            setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }))
            return false
        }
        setErrors(prev => ({ ...prev, password: '' }))
        return true
    }

    const validateConfirmPassword = (password: string, confirmPassword: string): boolean => {
        if (mode === 'register') {
            if (!confirmPassword) {
                setErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your password' }))
                return false
            }
            if (password !== confirmPassword) {
                setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
                return false
            }
        }
        setErrors(prev => ({ ...prev, confirmPassword: '' }))
        return true
    }

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // Clear API error when user starts typing
        if (errors.apiError) {
            setErrors(prev => ({ ...prev, apiError: '' }))
        }
    }

    // Handle blur events for real-time validation
    const handleBlur = (field: string) => {
        switch (field) {
            case 'email':
                validateEmail(formData.email)
                break
            case 'password':
                validatePassword(formData.password)
                break
            case 'confirmPassword':
                validateConfirmPassword(formData.password, formData.confirmPassword)
                break
        }
    }

    // Check if form is valid
    const isFormValid = (): boolean => {
        const emailValid = emailRegex.test(formData.email)
        const passwordValid = formData.password.length >= 8
        const confirmValid = mode === 'login' || formData.password === formData.confirmPassword
        return emailValid && passwordValid && confirmValid && !loading
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate all fields
        const emailValid = validateEmail(formData.email)
        const passwordValid = validatePassword(formData.password)
        const confirmValid = validateConfirmPassword(formData.password, formData.confirmPassword)

        if (!emailValid || !passwordValid || !confirmValid) {
            return
        }

        setLoading(true)
        setErrors(prev => ({ ...prev, apiError: '' }))

        try {
            const endpoint = mode === 'login'
                ? '/api/auth/login'
                : '/api/auth/register'

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Authentication failed')
            }

            // Store JWT token and user email
            localStorage.setItem('kairon_token', data.token)
            localStorage.setItem('user_email', formData.email)

            // Redirect to trade terminal
            window.location.href = '/trade'
        } catch (error: any) {
            setErrors(prev => ({
                ...prev,
                apiError: error.message
            }))
        } finally {
            setLoading(false)
        }
    }

    // Switch between login and register
    const handleModeSwitch = (newMode: AuthMode) => {
        setMode(newMode)
        setErrors({
            email: '',
            password: '',
            confirmPassword: '',
            apiError: ''
        })
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-[#050505] via-[#0A0A0A] to-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Cyan glow effect */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-150 h-150 bg-[#00E5FF] opacity-[0.03] blur-[120px] rounded-full"></div>
            </div>

            {/* Auth Container */}
            <div className="relative w-full max-w-110">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Terminal className="w-8 h-8 text-[#00E5FF]" />
                        <h1 className="text-3xl font-bold font-mono tracking-wider text-white">
                            KAIRON
                        </h1>
                    </div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">
            // AUTHENTICATION
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                        Secure access to KAIRON trading engine
                    </p>
                </div>

                {/* Auth Card */}
                <div className="bg-[#0A0B0D] border border-white/10 p-8 relative group">
                    {/* Cyan glow on focus */}
                    <div className="absolute inset-0 border border-[#00E5FF] opacity-0 group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none"></div>

                    {/* Mode Tabs */}
                    <div className="flex gap-0 mb-8 border-b border-white/10">
                        <button
                            onClick={() => handleModeSwitch('login')}
                            className={`flex-1 pb-3 text-sm font-mono uppercase tracking-widest transition-all duration-200 ${mode === 'login'
                                    ? 'text-[#00E5FF] border-b-2 border-[#00E5FF]'
                                    : 'text-gray-600 hover:text-gray-400'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => handleModeSwitch('register')}
                            className={`flex-1 pb-3 text-sm font-mono uppercase tracking-widest transition-all duration-200 ${mode === 'register'
                                    ? 'text-[#00E5FF] border-b-2 border-[#00E5FF]'
                                    : 'text-gray-600 hover:text-gray-400'
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={() => handleBlur('email')}
                                className={`w-full px-4 py-3 bg-black border ${errors.email ? 'border-[#FF006E]' : 'border-white/20'
                                    } text-white font-mono text-sm focus:outline-none focus:border-[#00E5FF] focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all duration-200`}
                                placeholder="your@email.com"
                                disabled={loading}
                            />
                            {errors.email && (
                                <p className="text-[#FF006E] text-xs mt-2 uppercase tracking-wide font-mono">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={() => handleBlur('password')}
                                className={`w-full px-4 py-3 bg-black border ${errors.password ? 'border-[#FF006E]' : 'border-white/20'
                                    } text-white font-mono text-sm focus:outline-none focus:border-[#00E5FF] focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all duration-200`}
                                placeholder="••••••••"
                                disabled={loading}
                            />
                            {errors.password && (
                                <p className="text-[#FF006E] text-xs mt-2 uppercase tracking-wide font-mono">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password Field (Register Only) */}
                        {mode === 'register' && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('confirmPassword')}
                                    className={`w-full px-4 py-3 bg-black border ${errors.confirmPassword ? 'border-[#FF006E]' : 'border-white/20'
                                        } text-white font-mono text-sm focus:outline-none focus:border-[#00E5FF] focus:shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all duration-200`}
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-[#FF006E] text-xs mt-2 uppercase tracking-wide font-mono">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* API Error Message */}
                        {errors.apiError && (
                            <div className="border border-[#FF006E]/30 bg-[#FF006E]/5 p-3 animate-in fade-in duration-200">
                                <p className="text-[#FF006E] text-xs uppercase tracking-wide font-mono">
                                    {errors.apiError}
                                </p>
                            </div>
                        )}

                        {/* Submit Button - Slanted KAIRON Style */}
                        <button
                            type="submit"
                            disabled={!isFormValid()}
                            className={`w-full py-4 px-6 font-bold font-mono uppercase tracking-widest text-sm -skew-x-6 transition-all duration-150 active:scale-95 ${isFormValid()
                                    ? 'bg-[#00E5FF] text-black hover:shadow-[0_0_20px_rgba(0,229,255,0.6)] hover:brightness-110'
                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                }`}
                        >
                            <span className="skew-x-6 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>PROCESSING...</>
                                ) : mode === 'login' ? (
                                    <>
                                        ACCESS TERMINAL
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                ) : (
                                    <>
                                        CREATE ACCOUNT
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <p className="text-xs text-gray-600 font-mono">
                            {mode === 'login' ? (
                                <>
                                    New to KAIRON?{' '}
                                    <button
                                        onClick={() => handleModeSwitch('register')}
                                        className="text-[#00E5FF] hover:underline"
                                    >
                                        Create account
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have access?{' '}
                                    <button
                                        onClick={() => handleModeSwitch('login')}
                                        className="text-[#00E5FF] hover:underline"
                                    >
                                        Sign in
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Bottom Link */}
                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="text-xs text-gray-600 hover:text-gray-400 font-mono uppercase tracking-widest transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
