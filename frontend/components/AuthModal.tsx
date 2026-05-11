"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useAuth } from "@/context/AuthContext"

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    initialMode?: AuthMode
}

type AuthMode = "login" | "register"

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
    const { login, register, isLoading } = useAuth()
    const [mode, setMode] = useState<AuthMode>("login")
    const [fullName, setFullName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!isOpen) {
            setMode("login")
            setFullName("")
            setUsername("")
            setEmail("")
            setPassword("")
            setConfirmPassword("")
            setError(null)
            setIsSubmitting(false)
            return
        }

        setMode(initialMode)
        setError(null)
    }, [isOpen, initialMode])

    if (!isOpen || !mounted) return null

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            if (mode === "login") {
                await login(email, password, true)
            } else {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match")
                }
                await register({
                    fullName: fullName.trim(),
                    username: username.trim(),
                    email: email.trim(),
                    password
                })
            }
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Authentication failed")
        } finally {
            setIsSubmitting(false)
        }
    }

    const isBusy = isLoading || isSubmitting

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <button
                type="button"
                aria-label="Close auth modal"
                onClick={onClose}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <div className="relative z-10 w-full max-w-md mx-4 border border-white/10 bg-[#0d1117]/90 backdrop-blur-md p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="text-sm font-mono uppercase tracking-[0.2em] text-[#8D8F98]">
                        {mode === "login" ? "Secure Login" : "Create Account"}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[#8D8F98] hover:text-[#00E5FF] text-sm font-mono"
                    >
                        Close
                    </button>
                </div>

                <div className="text-2xl font-bold font-mono text-[#E6E6E6] mb-6">
                    {mode === "login" ? "Welcome Back" : "Join KAIRON"}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "register" && (
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-[#8D8F98]">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(event) => setFullName(event.target.value)}
                                className="w-full bg-[#0b0f14] border border-white/10 px-3 py-2 text-sm font-mono text-[#E6E6E6] outline-none focus:border-[#00E5FF]"
                                placeholder="Avery Morgan"
                                required
                            />
                        </div>
                    )}

                    {mode === "register" && (
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-[#8D8F98]">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(event) => setUsername(event.target.value.toLowerCase())}
                                className="w-full bg-[#0b0f14] border border-white/10 px-3 py-2 text-sm font-mono text-[#E6E6E6] outline-none focus:border-[#00E5FF]"
                                placeholder="kairon_ops"
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-[#8D8F98]">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full bg-[#0b0f14] border border-white/10 px-3 py-2 text-sm font-mono text-[#E6E6E6] outline-none focus:border-[#00E5FF]"
                            placeholder="trader@kairon.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-[#8D8F98]">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full bg-[#0b0f14] border border-white/10 px-3 py-2 text-sm font-mono text-[#E6E6E6] outline-none focus:border-[#00E5FF]"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {mode === "register" && (
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-[#8D8F98]">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                className="w-full bg-[#0b0f14] border border-white/10 px-3 py-2 text-sm font-mono text-[#E6E6E6] outline-none focus:border-[#00E5FF]"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-red-400 font-mono border border-red-500/30 bg-red-500/10 px-3 py-2">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isBusy}
                        className="w-full py-3 bg-[#00E5FF] text-black font-bold font-mono uppercase text-sm hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-all disabled:opacity-60"
                    >
                        {isBusy
                            ? "Authenticating..."
                            : mode === "login"
                                ? "Login"
                                : "Create Account"}
                    </button>
                </form>

                <div className="mt-6 text-xs font-mono text-[#8D8F98]">
                    {mode === "login" ? "New to KAIRON?" : "Already have an account?"}
                    <button
                        type="button"
                        onClick={() => setMode(mode === "login" ? "register" : "login")}
                        className="ml-2 text-[#00E5FF] hover:text-white transition-colors"
                    >
                        {mode === "login" ? "Create Account" : "Login"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
