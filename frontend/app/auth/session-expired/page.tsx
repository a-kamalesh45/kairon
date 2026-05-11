"use client"

import Link from "next/link"
import { AuthShell } from "@/components/auth/AuthShell"
import { AuthAside } from "@/components/auth/AuthAside"

export default function SessionExpiredPage() {
    return (
        <AuthShell
            left={
                <div className="space-y-8">
                    <div className="space-y-3">
                        <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#FF007A]">Session Expired</div>
                        <h1 className="text-4xl font-bold tracking-tight text-white">Re-authenticate</h1>
                        <p className="text-sm text-[#8D8F98] max-w-md">
                            Your session token is no longer valid. Access requires a new authentication cycle.
                        </p>
                    </div>

                    <div className="border border-[#FF007A]/40 bg-[#FF007A]/10 p-5">
                        <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#FF007A]">Session terminated</div>
                        <p className="text-sm text-[#8D8F98] mt-3">
                            Re-authentication restores secure access and refreshes your session controls.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href="/auth/login"
                            className="px-6 py-3 bg-[#00E5FF] text-black font-bold font-mono uppercase text-sm -skew-x-6 hover:shadow-[0_0_20px_rgba(0,229,255,0.5)] transition-all"
                        >
                            <span className="skew-x-6 block">Return to login</span>
                        </Link>
                        <Link
                            href="/"
                            className="px-6 py-3 border border-white/10 text-white font-mono uppercase text-sm -skew-x-6 hover:border-[#00E5FF]/40 hover:text-[#00E5FF] transition-colors"
                        >
                            <span className="skew-x-6 block">Back home</span>
                        </Link>
                    </div>
                </div>
            }
            right={
                <AuthAside
                    title="Session Integrity"
                    subtitle="Tokens are invalidated after inactivity or manual termination."
                    statusLabel="Session"
                    statusValue="EXPIRED"
                    metrics={[
                        { label: "TTL", value: "Elapsed" },
                        { label: "Revoke", value: "Enforced" },
                        { label: "Audit", value: "Logged" },
                        { label: "Risk", value: "Cleared" }
                    ]}
                    footer={"Re-authentication required"}
                />
            }
        />
    )
}
