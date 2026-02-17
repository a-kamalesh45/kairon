"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Terminal, TrendingUp, Settings, LogOut, Sun, Moon, BarChart3, Wallet, Globe } from "lucide-react"

interface Command {
    id: string
    label: string
    type: "navigation" | "action"
    path?: string
    action?: () => void
    icon?: React.ReactNode
}

export function CommandPalette() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    // Command definitions
    const commands: Command[] = useMemo(() => [
        {
            id: "dashboard",
            label: "Go to Dashboard",
            type: "navigation",
            path: "/dashboard",
            icon: <Terminal className="w-4 h-4" />
        },
        {
            id: "trade",
            label: "Go to Trade Terminal",
            type: "navigation",
            path: "/trade",
            icon: <TrendingUp className="w-4 h-4" />
        },
        {
            id: "portfolio",
            label: "Go to Portfolio",
            type: "navigation",
            path: "/portfolio",
            icon: <Wallet className="w-4 h-4" />
        },
        {
            id: "markets",
            label: "Go to Markets",
            type: "navigation",
            path: "/markets",
            icon: <Globe className="w-4 h-4" />
        },
        {
            id: "settings",
            label: "Go to Settings",
            type: "navigation",
            path: "/settings",
            icon: <Settings className="w-4 h-4" />
        },
        {
            id: "logout",
            label: "Logout",
            type: "action",
            action: () => {
                localStorage.removeItem("kairon_token")
                router.push("/auth")
            },
            icon: <LogOut className="w-4 h-4" />
        }
    ], [router])

    // Fuzzy search implementation
    const fuzzyMatch = (str: string, pattern: string): { match: boolean, score: number } => {
        if (!pattern) return { match: true, score: 0 }
        
        const lowerStr = str.toLowerCase()
        const lowerPattern = pattern.toLowerCase()
        
        // Exact match
        if (lowerStr === lowerPattern) return { match: true, score: 1000 }
        
        // Prefix match
        if (lowerStr.startsWith(lowerPattern)) return { match: true, score: 500 }
        
        // Contains match
        if (lowerStr.includes(lowerPattern)) return { match: true, score: 300 }
        
        // Fuzzy character sequence match
        let patternIdx = 0
        let score = 0
        let consecutive = 0
        
        for (let i = 0; i < lowerStr.length && patternIdx < lowerPattern.length; i++) {
            if (lowerStr[i] === lowerPattern[patternIdx]) {
                score += 10 + consecutive * 5 // Bonus for consecutive matches
                consecutive++
                patternIdx++
            } else {
                consecutive = 0
            }
        }
        
        const match = patternIdx === lowerPattern.length
        return { match, score }
    }

    // Filter and sort commands
    const filteredCommands = useMemo(() => {
        const results = commands
            .map(cmd => ({
                ...cmd,
                ...fuzzyMatch(cmd.label, query)
            }))
            .filter(cmd => cmd.match)
            .sort((a, b) => b.score - a.score)
        
        return results
    }, [commands, query])

    // Global keyboard listener for Cmd+K / Ctrl+K
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault()
                setOpen(prev => !prev)
            }
        }

        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    // Focus input when opened
    useEffect(() => {
        if (open) {
            inputRef.current?.focus()
            setQuery("")
            setSelectedIndex(0)
        }
    }, [open])

    // Reset selected index when filtered results change
    useEffect(() => {
        setSelectedIndex(0)
    }, [filteredCommands])

    // Keyboard navigation inside palette
    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev => 
                    prev < filteredCommands.length - 1 ? prev + 1 : prev
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
                break
            case 'Enter':
                e.preventDefault()
                if (filteredCommands[selectedIndex]) {
                    executeCommand(filteredCommands[selectedIndex])
                }
                break
            case 'Escape':
                e.preventDefault()
                setOpen(false)
                break
        }
    }

    // Execute command
    const executeCommand = (command: Command) => {
        if (command.type === "navigation" && command.path) {
            router.push(command.path)
        } else if (command.type === "action" && command.action) {
            command.action()
        }
        setOpen(false)
    }

    if (!open) return null

    return (
        <div 
            className="fixed inset-0 z-9999 flex items-start justify-center pt-[15vh]"
            onClick={() => setOpen(false)}
        >
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-150"
                style={{ animation: 'fadeIn 150ms ease-out' }}
            />
            
            {/* Command Panel */}
            <div 
                className="relative w-full max-w-150 mx-4 bg-black border border-white/20 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'slideDown 150ms ease-out' }}
            >
                {/* Input Field */}
                <div className="border-b border-white/10">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a command or search..."
                        className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-500 outline-none caret-[#00E5FF] text-sm font-mono"
                        autoComplete="off"
                        spellCheck={false}
                    />
                </div>

                {/* Results List */}
                <div className="max-h-100 overflow-y-auto">
                    {filteredCommands.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                            No commands found
                        </div>
                    ) : (
                        <div>
                            {filteredCommands.map((command, index) => (
                                <div
                                    key={command.id}
                                    onClick={() => executeCommand(command)}
                                    className={`
                                        px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors duration-75
                                        border-l-2 border-transparent
                                        ${index === selectedIndex 
                                            ? 'bg-[#00E5FF]/10 border-l-[#00E5FF]' 
                                            : 'hover:bg-white/5'
                                        }
                                        ${index !== filteredCommands.length - 1 ? 'border-b border-white/5' : ''}
                                    `}
                                >
                                    {/* Icon */}
                                    <div className={`
                                        ${index === selectedIndex ? 'text-[#00E5FF]' : 'text-gray-400'}
                                        transition-colors duration-75
                                    `}>
                                        {command.icon}
                                    </div>

                                    {/* Label */}
                                    <div className={`
                                        text-sm font-mono flex-1
                                        ${index === selectedIndex ? 'text-white' : 'text-gray-300'}
                                    `}>
                                        {command.label}
                                    </div>

                                    {/* Type Badge */}
                                    <div className={`
                                        text-xs font-mono px-2 py-0.5 border
                                        ${command.type === 'navigation' 
                                            ? 'text-[#00E5FF] border-[#00E5FF]/30' 
                                            : 'text-gray-500 border-gray-500/30'
                                        }
                                    `}>
                                        {command.type === 'navigation' ? 'GO' : 'RUN'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Hint */}
                <div className="border-t border-white/10 px-4 py-2 flex items-center gap-4 text-xs text-gray-500 font-mono">
                    <span>↑↓ Navigate</span>
                    <span>↵ Execute</span>
                    <span>ESC Close</span>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideDown {
                    from { 
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    )
}
