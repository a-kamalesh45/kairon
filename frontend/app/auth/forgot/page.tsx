"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AuthShell } from "@/components/auth/AuthShell"
import { AuthAside } from "@/components/auth/AuthAside"

const inputClassName = "w-full bg-[#0B0E12] border border-white/10 px-3 py-2.5 text-sm font-mono text-[#E6E6E6] outline-none focus:border-[#00E5FF] focus:shadow-[0_0_18px_rgba(0,229,255,0.18)] transition-all"
const labelClassName = "text-[10px] font-mono uppercase tracking-[0.25em] text-[#8D8F98]"

export default function ForgotPasswordPage() {
    const [identifier, setIdentifier] = useState("")
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError(null)

        if (!identifier.trim()) {
            setError("Enter a valid email or username")
            return
        }

        setIsSubmitting(true)
        try {
            setSent(true)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AuthShell
            left={
                <div className="space-y-8">
                    <div className="space-y-3">
                        <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#5B636E]">Recovery</div>
                        <h1 className="text-4xl font-bold tracking-tight text-white">Reset Access</h1>
                        <p className="text-sm text-[#8D8F98] max-w-md">
                            Request a reset link for your KAIRON operator credentials.
                        </p>
                    </div>

                    {sent ? (
                        <div className="border border-[#00E5FF]/40 bg-[#00E5FF]/10 p-4">
                            <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#00E5FF]">Request queued</div>
                            <p className="text-sm text-[#8D8F98] mt-2">
                                If the account exists, a recovery link will arrive shortly.
                            </p>
                            <Link href="/auth/login" className="mt-4 inline-flex text-xs font-mono uppercase tracking-[0.2em] text-[#00E5FF] hover:text-white transition-colors">
                                Return to login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className={labelClassName}>Email or Username</label>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(event) => setIdentifier(event.target.value)}
                                    className={inputClassName}
                                    placeholder="operator@kairon.com"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="border border-[#FF007A]/40 bg-[#FF007A]/10 px-3 py-2 text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF007A]">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 bg-[#00E5FF] text-black font-bold font-mono uppercase text-sm -skew-x-6 transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.5)] disabled:opacity-60"
                            >
                                <span className="skew-x-6 flex items-center justify-center gap-2">
                                    {isSubmitting ? "SUBMITTING..." : "REQUEST RESET"}
                                    {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                                </span>
                            </button>
                        </form>
                    )}

                    <div className="text-[11px] font-mono text-[#8D8F98]">
                        Need to sign in?{" "}
                        <Link href="/auth/login" className="text-[#00E5FF] hover:text-white transition-colors">
                            Access login
                        </Link>
                    </div>
                </div>
            }
            right={
                <AuthAside
                    title="Recovery Channel"
                    subtitle="Reset requests are rate-limited and logged for security review before delivery."
                    statusLabel="Recovery"
                    statusValue="AVAILABLE"
                    metrics={[
                        { label: "Verification", value: "Multi-step" },
                        { label: "Cooldown", value: "5 min" },
                        { label: "Signal", value: "Encrypted" },
                        { label: "Audit", value: "Enabled" }
                    ]}
                    footer={"Recovery does not disclose account presence"}
                />
            }
        />
    )
}
