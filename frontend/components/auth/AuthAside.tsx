"use client"

import type { ReactNode } from "react"

interface Metric {
    label: string
    value: string
}

interface AuthAsideProps {
    title: string
    subtitle: string
    statusLabel: string
    statusValue: string
    metrics: Metric[]
    footer?: ReactNode
}

export function AuthAside({ title, subtitle, statusLabel, statusValue, metrics, footer }: AuthAsideProps) {
    return (
        <div className="border border-white/10 bg-black/60 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-[#8D8F98]">
                <span>{statusLabel}</span>
                <span className="text-[#00E5FF]">{statusValue}</span>
            </div>

            <div className="mt-6">
                <div className="text-xl font-bold font-mono text-white">{title}</div>
                <div className="text-sm text-[#8D8F98] mt-2 leading-relaxed">{subtitle}</div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
                {metrics.map((metric) => (
                    <div key={metric.label} className="border border-white/10 bg-white/5 p-3">
                        <div className="text-[9px] uppercase tracking-[0.25em] text-[#5B636E] font-mono">
                            {metric.label}
                        </div>
                        <div className="text-lg font-bold font-mono text-[#E6E6E6] mt-2">{metric.value}</div>
                    </div>
                ))}
            </div>

            {footer ? <div className="mt-8 text-[10px] font-mono text-[#5B636E] uppercase tracking-[0.2em]">{footer}</div> : null}
        </div>
    )
}
