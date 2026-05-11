"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    Bell, User, LogOut, Settings, Terminal, BarChart3, Wallet,
    Sun, Moon
} from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useAuth } from '@/context/AuthContext'

interface NavbarProps {
    className?: string
}

export function GlobalNavbar({ className = '' }: NavbarProps) {
    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 backdrop-blur-md bg-black/90 flex items-center justify-between px-6 shrink-0 ${className}`}>
            <LeftNav />
            <RightNav />
        </nav>
    )
}

// ============================================
// LEFT SECTION - Brand + Navigation
// ============================================

function LeftNav() {
    const pathname = usePathname()
    const [lastTradeSymbol, setLastTradeSymbol] = useState<string>('BTCUSDT')

    useEffect(() => {
        // Load last visited symbol from localStorage
        const saved = localStorage.getItem('last_trade_symbol')
        if (saved) setLastTradeSymbol(saved)
    }, [])

    return (
        <div className="flex items-center gap-6">
            {/* Brand Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 group cursor-pointer">
                <div className="relative w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded overflow-hidden group-hover:border-[#00E5FF] transition-colors duration-150">
                    <Terminal className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold tracking-[0.3em] text-white">KAIRON</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex gap-8 text-xs font-mono text-gray-400">
                <Link
                    href="/"
                    className={`hover:text-[#00E5FF] transition-colors duration-150 uppercase ${pathname === '/' ? 'text-[#00E5FF]' : ''
                        }`}
                >
                    HOME
                </Link>
                <Link
                    href="/markets"
                    className={`hover:text-[#00E5FF] transition-colors duration-150 uppercase ${pathname.startsWith('/markets') ? 'text-[#00E5FF]' : ''
                        }`}
                >
                    MARKETS
                </Link>
                <Link
                    href={`/trade?symbol=${lastTradeSymbol}`}
                    className={`hover:text-[#00E5FF] transition-colors duration-150 uppercase ${pathname === '/trade' ? 'text-[#00E5FF]' : ''
                        }`}
                >
                    TRADE
                </Link>
                <Link
                    href="/docs"
                    className={`hover:text-[#00E5FF] transition-colors duration-150 uppercase ${pathname === '/docs' ? 'text-[#00E5FF]' : ''
                        }`}
                >
                    DOCS
                </Link>
            </div>
        </div>
    )
}

// ============================================
// RIGHT SECTION - Icons & User
// ============================================

function RightNav() {
    const { theme, toggleTheme } = useTheme()
    const { user, logout } = useAuth()
    const [showProfile, setShowProfile] = useState(false)

    return (
        <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="p-2 hover:bg-white/5 rounded transition-colors"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <button
                className="p-2 hover:bg-white/5 rounded transition-colors relative"
                aria-label="Notifications"
            >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF006E] rounded-full" />
            </button>

            {/* Dashboard */}
            <Link
                href="/dashboard"
                className="p-2 hover:bg-white/5 rounded transition-colors"
                aria-label="Dashboard"
            >
                <BarChart3 size={18} />
            </Link>

            {/* Portfolio */}
            <Link
                href="/portfolio"
                className="p-2 hover:bg-white/5 rounded transition-colors"
                aria-label="Portfolio"
            >
                <Wallet size={18} />
            </Link>

            {/* Settings */}
            <Link
                href="/settings"
                className="p-2 hover:bg-white/5 rounded transition-colors"
                aria-label="Settings"
            >
                <Settings size={18} />
            </Link>

            {!user ? (
                <div className="flex items-center gap-2">
                    <Link
                        href="/auth/login"
                        className="px-4 py-2 border border-white/10 text-xs font-mono uppercase text-white hover:text-[#00E5FF] hover:border-[#00E5FF]/50 transition-colors"
                    >
                        Login
                    </Link>
                    <Link
                        href="/auth/register"
                        className="px-4 py-2 bg-[#00E5FF] text-black font-bold font-mono uppercase text-xs hover:shadow-[0_0_18px_rgba(0,229,255,0.4)] transition-all"
                    >
                        Sign Up
                    </Link>
                </div>
            ) : (
                <div className="flex items-center gap-3 border border-white/10 bg-white/5 px-3 py-2">
                    <div className="hidden md:flex flex-col text-right">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500">Active</span>
                        <span className="text-xs font-mono text-white max-w-[140px] truncate">{user.email}</span>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="px-3 py-1.5 border border-white/10 text-[10px] font-mono uppercase text-white hover:text-[#00E5FF] hover:border-[#00E5FF]/40 transition-colors"
                    >
                        Logout
                    </button>
                    <button
                        onClick={() => setShowProfile(true)}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                        aria-label="Profile"
                    >
                        <User size={18} />
                    </button>
                </div>
            )}

            {/* Profile Panel */}
            {showProfile && user && (
                <ProfilePanel
                    onClose={() => setShowProfile(false)}
                    userEmail={user.email}
                    onLogout={() => {
                        logout()
                        setShowProfile(false)
                    }}
                />
            )}
        </div>
    )
}

// ============================================
// PROFILE SLIDE-OVER PANEL
// ============================================

function ProfilePanel({ onClose, userEmail, onLogout }: { onClose: () => void; userEmail: string; onLogout: () => void }) {
    const router = useRouter()

    const handleLogout = () => {
        onLogout()
        onClose()
        router.push('/')
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className="fixed top-0 right-0 h-full w-80 border-l shadow-2xl z-50"
                style={{
                    backgroundColor: 'rgba(5, 5, 5, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    animation: 'slideIn 200ms ease-out'
                }}
            >
                <div className="p-6">
                    <h2 className="text-lg font-bold text-white mb-6">Account</h2>

                    {/* User Info */}
                    <div className="mb-6 pb-6 border-b border-white/10">
                        <div className="text-sm text-gray-500 mb-1">Signed in as</div>
                        <div className="text-sm font-mono text-white">
                            {userEmail || 'trader@kairon.ai'}
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-2">
                        <ProfileMenuItem
                            icon={<Settings size={18} />}
                            label="Settings"
                            onClick={() => {
                                router.push('/settings')
                                onClose()
                            }}
                        />
                        <ProfileMenuItem
                            icon={<BarChart3 size={18} />}
                            label="Dashboard"
                            onClick={() => {
                                router.push('/dashboard')
                                onClose()
                            }}
                        />
                        <div className="pt-4 mt-4 border-t border-white/10">
                            <ProfileMenuItem
                                icon={<LogOut size={18} />}
                                label="Logout"
                                onClick={handleLogout}
                                danger
                            />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </>
    )
}

// ============================================
// PROFILE MENU ITEM
// ============================================

interface ProfileMenuItemProps {
    icon: React.ReactNode
    label: string
    onClick: () => void
    danger?: boolean
}

function ProfileMenuItem({ icon, label, onClick, danger }: ProfileMenuItemProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                danger
                    ? 'hover:bg-[#FF006E]/10 text-[#FF006E]'
                    : 'hover:bg-white/5 text-gray-400 hover:text-white'
            }`}
        >
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </button>
    )
}
