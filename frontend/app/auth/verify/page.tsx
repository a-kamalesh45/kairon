"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AuthShell } from "@/components/auth/AuthShell"
import { AuthAside } from "@/components/auth/AuthAside"

export default function VerifyPage() {
    const searchParams = useSearchParams()
    const email = searchParams.get("email") || ""
    const [resent, setResent] = useState(false)

    return (
        <AuthShell
            left={
                <div className="space-y-8">
                    <div className="space-y-3">
                        <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#5B636E]">Verification</div>
                        <h1 className="text-4xl font-bold tracking-tight text-white">Check Your Inbox</h1>
                        <p className="text-sm text-[#8D8F98] max-w-md">
                            A verification signal has been issued for{email ? ` ${email}` : " your account"}. Confirm to activate the session.
                        </p>
                    </div>

                    <div className="border border-white/10 bg-black/60 p-5">
                        <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#00E5FF]">Pending confirmation</div>
                        <p className="text-sm text-[#8D8F98] mt-3">
                            Verification links expire after 30 minutes. If you do not see the message, check your spam filters.
                        </p>
                        <button
                            type="button"
                            onClick={() => setResent(true)}
                            className="mt-4 px-4 py-2 border border-white/10 text-xs font-mono uppercase tracking-[0.2em] text-white hover:text-[#00E5FF] hover:border-[#00E5FF]/40 transition-colors"
                        >
                            Resend verification
                        </button>
                        {resent && (
                            <div className="mt-3 text-[10px] font-mono uppercase tracking-[0.2em] text-[#00E5FF]">
                                Verification signal reissued
                            </div>
                        )}
                    </div>

                    <div className="text-[11px] font-mono text-[#8D8F98]">
                        Need to login now?{" "}
                        <Link href="/auth/login" className="text-[#00E5FF] hover:text-white transition-colors">
                            Access login
                        </Link>
                    </div>
                </div>
            }
            right={
                <AuthAside
                    title="Session Activation"
                    subtitle="Verification locks the account to the originating device fingerprint and audit path."
                    statusLabel="Verification"
                    statusValue="PENDING"
                    metrics={[
                        { label: "Token TTL", value: "30 min" },
                        { label: "Device Bind", value: "Enabled" },
                        { label: "Audit Trail", value: "Queued" },
                        { label: "Session", value: "Dormant" }
                    ]}
                    footer={"Verification required before trading"}
                />
            }
        />
    )
}
