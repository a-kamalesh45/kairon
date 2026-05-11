"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { AuthShell } from "@/components/auth/AuthShell"
import { AuthAside } from "@/components/auth/AuthAside"
import { useAuth } from "@/context/AuthContext"

const inputClassName = "w-full bg-[#0B0E12] border border-white/10 px-3 py-2.5 text-sm font-mono text-[#E6E6E6] outline-none focus:border-[#00E5FF] focus:shadow-[0_0_18px_rgba(0,229,255,0.18)] transition-all"
const labelClassName = "text-[10px] font-mono uppercase tracking-[0.25em] text-[#8D8F98]"

const usernameRegex = /^[a-z0-9_]{3,24}$/

export default function RegisterPage() {
    const router = useRouter()
    const { register, isLoading } = useAuth()

    const [fullName, setFullName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const passwordStrength = useMemo(() => {
        let score = 0
        if (password.length >= 8) score += 1
        if (password.length >= 12) score += 1
        if (/[A-Z]/.test(password)) score += 1
        if (/[0-9]/.test(password)) score += 1
        if (/[^A-Za-z0-9]/.test(password)) score += 1
        return Math.min(score, 4)
    }, [password])

    const strengthLabels = ["Weak", "Guarded", "Stable", "Strong", "Elite"]
    const strengthLabel = strengthLabels[passwordStrength]

    const passwordsMatch = password.length > 0 && password === confirmPassword
    const usernameValid = usernameRegex.test(username)
    const isBusy = isLoading || isSubmitting

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)

        if (!fullName.trim() || !email.trim() || !usernameValid || !password) {
            setError("Complete all required fields")
            return
        }

        if (password.length < 10) {
            setError("Password must be at least 10 characters")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setIsSubmitting(true)
        try {
            await register({
                fullName: fullName.trim(),
                username: username.trim(),
                email: email.trim(),
                password
            })
            router.push(`/auth/verify?email=${encodeURIComponent(email.trim())}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Account initialization failed")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AuthShell
            left={
                <div className="space-y-8">
                    <div className="space-y-3">
                        <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#5B636E]">Provision Access</div>
                        <h1 className="text-4xl font-bold tracking-tight text-white">Create Account</h1>
                        <p className="text-sm text-[#8D8F98] max-w-md">
                            Register a trading identity with secure credentials and institutional safeguards.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className={labelClassName}>Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(event) => setFullName(event.target.value)}
                                    className={inputClassName}
                                    placeholder="Avery Morgan"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className={labelClassName}>Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value.toLowerCase().replace(/\s+/g, ""))}
                                    className={inputClassName}
                                    placeholder="kairon_ops"
                                    required
                                />
                                {!usernameValid && username.length > 0 && (
                                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FF007A]">
                                        Use 3-24 chars: a-z, 0-9, _
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={labelClassName}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className={inputClassName}
                                placeholder="operator@kairon.com"
                                required
                            />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className={labelClassName}>Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        className={`${inputClassName} pr-12`}
                                        placeholder="Minimum 10 characters"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D8F98] hover:text-[#00E5FF]"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        {[0, 1, 2, 3].map((index) => (
                                            <span
                                                key={index}
                                                className={`h-1.5 w-6 border border-white/10 ${passwordStrength > index ? "bg-[#00E5FF]" : "bg-white/10"}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8D8F98]">
                                        {strengthLabel}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className={labelClassName}>Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        className={`${inputClassName} pr-12`}
                                        placeholder="Re-enter password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D8F98] hover:text-[#00E5FF]"
                                        aria-label={showConfirm ? "Hide password" : "Show password"}
                                    >
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {!passwordsMatch && confirmPassword.length > 0 && (
                                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FF007A]">
                                        Passwords do not match
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="border border-[#FF007A]/40 bg-[#FF007A]/10 px-3 py-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF007A]">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isBusy}
                            className="w-full py-3 bg-[#00E5FF] text-black font-bold font-mono uppercase text-sm -skew-x-6 transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.5)] disabled:opacity-60"
                        >
                            <span className="skew-x-6 flex items-center justify-center gap-2">
                                {isBusy ? "PROVISIONING..." : "CREATE ACCOUNT"}
                                {!isBusy && <ArrowRight className="w-4 h-4" />}
                            </span>
                        </button>
                    </form>

                    <div className="text-[11px] font-mono text-[#8D8F98]">
                        Already provisioned?{" "}
                        <Link href="/auth/login" className="text-[#00E5FF] hover:text-white transition-colors">
                            Login
                        </Link>
                    </div>
                </div>
            }
            right={
                <AuthAside
                    title="Identity Provisioning"
                    subtitle="KAIRON onboarding enforces operator identity standards, audit trails, and risk constraints before session activation."
                    statusLabel="Provisioning"
                    statusValue="ACTIVE"
                    metrics={[
                        { label: "Risk Profile", value: "Tier 1" },
                        { label: "Wallet Seed", value: "100k USDT" },
                        { label: "Compliance", value: "Verified" },
                        { label: "Telemetry", value: "Encrypted" }
                    ]}
                    footer={"No marketing. No noise. Full control."}
                />
            }
        />
    )
}
