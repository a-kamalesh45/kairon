"use client"

import { AuthShell } from "@/components/auth/AuthShell"
import { AuthAside } from "@/components/auth/AuthAside"

export default function AuthenticatingPage() {
    return (
        <AuthShell
            left={
                <div className="space-y-8">
                    <div className="space-y-3">
                        <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#00E5FF]">Authenticating</div>
                        <h1 className="text-4xl font-bold tracking-tight text-white">Initializing Session</h1>
                        <p className="text-sm text-[#8D8F98] max-w-md">
                            Validating credentials, session scope, and infrastructure availability.
                        </p>
                    </div>

                    <div className="border border-white/10 bg-black/60 p-5">
                        <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#8D8F98]">Signal processing</div>
                        <div className="mt-4 h-1.5 w-full bg-white/10 overflow-hidden">
                            <div className="h-full w-1/2 bg-[#00E5FF] animate-pulse" />
                        </div>
                        <div className="mt-3 text-[10px] font-mono uppercase tracking-[0.2em] text-[#5B636E]">
                            Access latency under 20ms
                        </div>
                    </div>
                </div>
            }
            right={
                <AuthAside
                    title="Secure Handshake"
                    subtitle="Connection verified against system integrity checks and policy constraints."
                    statusLabel="Handshake"
                    statusValue="ACTIVE"
                    metrics={[
                        { label: "Latency", value: "14ms" },
                        { label: "Cipher", value: "AES-256" },
                        { label: "Region", value: "Primary" },
                        { label: "Audit", value: "Linked" }
                    ]}
                    footer={"Please keep this window active"}
                />
            }
        />
    )
}
