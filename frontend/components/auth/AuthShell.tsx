"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Terminal } from "lucide-react"

interface AuthShellProps {
    left: ReactNode
    right?: ReactNode
}

export function AuthShell({ left, right }: AuthShellProps) {
    return (
        <div className="min-h-screen relative overflow-hidden bg-[#050609] text-[#E6E6E6]">
            <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
                    backgroundSize: "48px 48px"
                }}
            />
            <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(0deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)"
                }}
            />
            <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#00E5FF]/10 blur-[140px] opacity-60 pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
                <div className="flex items-center justify-between mb-10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-white/10 bg-black/60 flex items-center justify-center">
                            <Terminal className="w-4 h-4 text-[#00E5FF]" />
                        </div>
                        <div>
                            <div className="text-[10px] font-mono uppercase tracking-[0.35em] text-[#8D8F98]">KAIRON</div>
                            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00E5FF]">Secure Access</div>
                        </div>
                    </Link>
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#5B636E]">
                        Institutional Terminal Access
                    </div>
                </div>

                <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-start">
                    <div>{left}</div>
                    {right ? <div className="hidden lg:block">{right}</div> : null}
                </div>
            </div>
        </div>
    )
}
