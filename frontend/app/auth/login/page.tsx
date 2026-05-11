"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { AuthShell } from "@/components/auth/AuthShell"
import { AuthAside } from "@/components/auth/AuthAside"
import { useAuth } from "@/context/AuthContext"

const inputClassName = "w-full bg-[#0B0E12] border border-white/10 px-3 py-2.5 text-sm font-mono text-[#E6E6E6] outline-none focus:border-[#00E5FF] focus:shadow-[0_0_18px_rgba(0,229,255,0.18)] transition-all"
const labelClassName = "text-[10px] font-mono uppercase tracking-[0.25em] text-[#8D8F98]"

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login, isLoading } = useAuth()

    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")
    const [remember, setRemember] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const nextPath = searchParams.get("next") || "/trade"
    const isBusy = isLoading || isSubmitting

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            await login(identifier.trim(), password, remember)
            router.push(nextPath)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Authentication failed")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AuthShell
            left={
                <div className="space-y-8">
                    <div className="space-y-3">
                        <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#5B636E]">Secure Login</div>
                        <h1 className="text-4xl font-bold tracking-tight text-white">Initialize Session</h1>
                        <p className="text-sm text-[#8D8F98] max-w-md">
                            Access the KAIRON trading terminal with credentialed verification and session telemetry.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className={labelClassName}>Email or Username</label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(event) => setIdentifier(event.target.value)}
                                autoFocus
                                className={inputClassName}
                                placeholder="operator@kairon.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className={labelClassName}>Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    className={`${inputClassName} pr-12`}
                                    placeholder="••••••••••"
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
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono text-[#8D8F98]">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(event) => setRemember(event.target.checked)}
                                    className="accent-[#00E5FF]"
                                />
                                Remember session
                            </label>
                            <Link href="/auth/forgot" className="text-[#00E5FF] hover:text-white transition-colors">
                                Forgot password
                            </Link>
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
                                {isBusy ? "AUTHENTICATING..." : "ACCESS TERMINAL"}
                                {!isBusy && <ArrowRight className="w-4 h-4" />}
                            </span>
                        </button>
                    </form>

                    <div className="text-[11px] font-mono text-[#8D8F98]">
                        New to KAIRON?{" "}
                        <Link href="/auth/register" className="text-[#00E5FF] hover:text-white transition-colors">
                            Create account
                        </Link>
                    </div>
                </div>
            }
            right={
                <AuthAside
                    title="Access Control"
                    subtitle="Session tokens are scoped per device, logged, and audited across the KAIRON infrastructure plane."
                    statusLabel="System"
                    statusValue="ONLINE"
                    metrics={[
                        { label: "Auth Latency", value: "12ms" },
                        { label: "Session TTL", value: "30 days" },
                        { label: "Risk Gate", value: "Active" },
                        { label: "Audit Log", value: "Streaming" }
                    ]}
                    footer={"Encrypted transport enforced"}
                />
            }
        />
    )
}
