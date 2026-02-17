"use client"

import React, { useState, useEffect } from "react"
import { Terminal, Key, Trash2, AlertTriangle, Copy, Check, ArrowRight, Zap } from "lucide-react"
import Link from "next/link"

interface ApiKey {
    id: string
    keyId: string
    createdAt: string
    status: 'active' | 'revoked'
}

interface GeneratedKey {
    apiKey: string
    apiSecret: string
}

export default function SettingsPage() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
    const [loading, setLoading] = useState(true)
    const [generatedKey, setGeneratedKey] = useState<GeneratedKey | null>(null)
    const [showSecretModal, setShowSecretModal] = useState(false)
    const [copiedKey, setCopiedKey] = useState(false)
    const [copiedSecret, setCopiedSecret] = useState(false)

    // Reset Account Modal State
    const [showResetModal, setShowResetModal] = useState(false)
    const [resetConfirmText, setResetConfirmText] = useState('')
    const [resetting, setResetting] = useState(false)

    // Latency Toggle State
    const [latencyEnabled, setLatencyEnabled] = useState(false)

    // Load API keys on mount
    useEffect(() => {
        loadApiKeys()

        // Load latency preference
        const savedLatency = localStorage.getItem('kairon_latency')
        if (savedLatency === '500') {
            setLatencyEnabled(true)
        }
    }, [])

    // Load API keys from backend
    const loadApiKeys = async () => {
        try {
            const token = localStorage.getItem('kairon_token')
            const res = await fetch('/api/keys/list', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (res.ok) {
                const data = await res.json()
                setApiKeys(data.keys)
            }
        } catch (error) {
            console.error('Failed to load API keys:', error)
        } finally {
            setLoading(false)
        }
    }

    // Generate new API key
    const generateApiKey = async () => {
        try {
            const token = localStorage.getItem('kairon_token')
            const res = await fetch('/api/keys/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (res.ok) {
                const data = await res.json()
                setGeneratedKey({
                    apiKey: data.apiKey,
                    apiSecret: data.apiSecret
                })
                setShowSecretModal(true)

                // Reload keys list
                await loadApiKeys()
            }
        } catch (error) {
            console.error('Failed to generate API key:', error)
        }
    }

    // Revoke API key
    const revokeApiKey = async (keyId: string) => {
        try {
            const token = localStorage.getItem('kairon_token')
            const res = await fetch('/api/keys/revoke', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ keyId })
            })

            if (res.ok) {
                // Update UI immediately
                setApiKeys(prev => prev.map(key =>
                    key.keyId === keyId ? { ...key, status: 'revoked' } : key
                ))
            }
        } catch (error) {
            console.error('Failed to revoke API key:', error)
        }
    }

    // Reset account
    const resetAccount = async () => {
        if (resetConfirmText !== 'RESET') return

        setResetting(true)
        try {
            const token = localStorage.getItem('kairon_token')
            const res = await fetch('/api/account/reset', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (res.ok) {
                setShowResetModal(false)
                setResetConfirmText('')
                // Show success message
                alert('Account reset successful. Balance restored to $100,000.')
            }
        } catch (error) {
            console.error('Failed to reset account:', error)
        } finally {
            setResetting(false)
        }
    }

    // Copy to clipboard
    const copyToClipboard = async (text: string, type: 'key' | 'secret') => {
        await navigator.clipboard.writeText(text)
        if (type === 'key') {
            setCopiedKey(true)
            setTimeout(() => setCopiedKey(false), 2000)
        } else {
            setCopiedSecret(true)
            setTimeout(() => setCopiedSecret(false), 2000)
        }
    }

    // Close secret modal and clear generated key
    const closeSecretModal = () => {
        setShowSecretModal(false)
        setCopiedKey(false)
        setCopiedSecret(false)
        // Clear after a delay to allow animation
        setTimeout(() => setGeneratedKey(null), 300)
    }

    // Toggle latency
    const toggleLatency = () => {
        const newValue = !latencyEnabled
        setLatencyEnabled(newValue)

        if (newValue) {
            localStorage.setItem('kairon_latency', '500')
        } else {
            localStorage.removeItem('kairon_latency')
        }
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="border-b border-white/10 px-6 py-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">
                // DEVELOPER SETTINGS
                            </p>
                            <h1 className="text-3xl font-bold font-mono tracking-wider text-white mb-2">
                                System Controls
                            </h1>
                            <p className="text-sm text-gray-600">
                                Advanced controls for API access and simulation environment
                            </p>
                        </div>

                        <Link
                            href="/trade"
                            className="text-[#00E5FF] hover:text-[#00B8CC] text-sm font-mono uppercase tracking-widest transition-colors"
                        >
                            ← Back to Terminal
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

                {/* SECTION 1: API Key Management */}
                <div className="border border-white/10 bg-[#0A0B0D] p-8 hover:border-[#00E5FF]/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <Key className="w-6 h-6 text-[#00E5FF]" />
                        <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-white">
                            API Key Management
                        </h2>
                    </div>

                    <p className="text-sm text-gray-600 mb-8">
                        Generate and manage programmatic trading access.
                    </p>

                    {/* API Keys List */}
                    <div className="space-y-4 mb-8">
                        {loading ? (
                            <div className="text-gray-600 font-mono text-sm">Loading keys...</div>
                        ) : apiKeys.length === 0 ? (
                            <div className="text-gray-600 font-mono text-sm border border-white/10 p-4">
                                No API keys generated yet.
                            </div>
                        ) : (
                            apiKeys.map((key) => (
                                <div
                                    key={key.id}
                                    className="border border-white/10 p-4 flex items-center justify-between hover:border-white/20 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <code className={`font-mono text-sm ${key.status === 'active' ? 'text-[#00E5FF]' : 'text-[#FF006E]'
                                                }`}>
                                                {key.keyId}
                                            </code>
                                            <span className={`text-xs uppercase tracking-widest font-mono px-2 py-1 border ${key.status === 'active'
                                                    ? 'border-[#00E5FF]/30 text-[#00E5FF]'
                                                    : 'border-[#FF006E]/30 text-[#FF006E]'
                                                }`}>
                                                {key.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 font-mono">
                                            Created: {new Date(key.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    {key.status === 'active' && (
                                        <button
                                            onClick={() => revokeApiKey(key.keyId)}
                                            className="py-2 px-4 border border-[#FF006E] text-[#FF006E] hover:bg-[#FF006E] hover:text-black font-bold font-mono uppercase tracking-widest text-xs -skew-x-6 hover:shadow-[0_0_15px_rgba(255,0,110,0.4)] transition-all duration-150"
                                        >
                                            <span className="skew-x-6 block">REVOKE</span>
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Generate New Key Button */}
                    <button
                        onClick={generateApiKey}
                        className="py-3 px-6 bg-[#00E5FF] text-black font-bold font-mono uppercase tracking-widest text-sm -skew-x-6 hover:shadow-[0_0_20px_rgba(0,229,255,0.6)] transition-all duration-150 active:scale-95"
                    >
                        <span className="skew-x-6 flex items-center gap-2">
                            GENERATE NEW KEY
                            <ArrowRight className="w-4 h-4" />
                        </span>
                    </button>
                </div>

                {/* SECTION 2: Simulation Controls */}
                <div className="border border-white/10 bg-[#0A0B0D] p-8 hover:border-[#00E5FF]/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <Terminal className="w-6 h-6 text-[#00E5FF]" />
                        <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-white">
                            Simulation Controls
                        </h2>
                    </div>

                    <p className="text-sm text-gray-600 mb-8">
                        Modify your simulated trading environment.
                    </p>

                    {/* Reset Account */}
                    <div className="mb-8 p-6 border border-[#FF006E]/30 bg-[#FF006E]/5">
                        <div className="flex items-start gap-4 mb-4">
                            <AlertTriangle className="w-6 h-6 text-[#FF006E] mt-1" />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold font-mono text-white mb-2">
                                    Reset Account (Nuclear Option)
                                </h3>
                                <p className="text-sm text-gray-400 mb-1">
                                    This will wipe all trades and reset your balance to $100,000.
                                </p>
                                <p className="text-xs text-[#FF006E] uppercase tracking-widest font-mono">
                                    THIS ACTION CANNOT BE UNDONE.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowResetModal(true)}
                            className="py-3 px-6 bg-[#FF006E] text-black font-bold font-mono uppercase tracking-widest text-sm -skew-x-6 hover:shadow-[0_0_20px_rgba(255,0,110,0.6)] transition-all duration-150 active:scale-95"
                        >
                            <span className="skew-x-6 flex items-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                RESET ACCOUNT (NUCLEAR OPTION)
                            </span>
                        </button>
                    </div>

                    {/* Latency Toggle */}
                    <div className="p-6 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Zap className="w-5 h-5 text-[#00E5FF]" />
                                <div>
                                    <h3 className="text-base font-bold font-mono text-white mb-1">
                                        ARTIFICIAL LATENCY
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Inject delay into UI to simulate network lag.
                                    </p>
                                </div>
                            </div>

                            {/* Toggle Switch */}
                            <button
                                onClick={toggleLatency}
                                className={`relative w-16 h-8 border-2 transition-all duration-200 ${latencyEnabled
                                        ? 'border-[#00E5FF] bg-[#00E5FF]/20'
                                        : 'border-white/30 bg-black'
                                    }`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white transition-all duration-200 ${latencyEnabled ? 'left-9' : 'left-1'
                                    }`} />
                            </button>
                        </div>

                        {latencyEnabled && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-xs text-[#00E5FF] font-mono uppercase tracking-widest">
                                    500ms Delay Active
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Secret Modal */}
            {showSecretModal && generatedKey && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#0A0B0D] border-2 border-[#00E5FF] max-w-2xl w-full p-8 shadow-[0_0_40px_rgba(0,229,255,0.3)]">
                        <div className="flex items-center gap-3 mb-6">
                            <Key className="w-6 h-6 text-[#00E5FF]" />
                            <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-white">
                                API Credentials Generated
                            </h2>
                        </div>

                        <div className="space-y-6 mb-8">
                            {/* API Key */}
                            <div>
                                <label className="block text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">
                                    API Key
                                </label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 px-4 py-3 bg-black border border-white/20 text-[#00E5FF] font-mono text-sm break-all">
                                        {generatedKey.apiKey}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(generatedKey.apiKey, 'key')}
                                        className="p-3 border border-white/20 hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors"
                                    >
                                        {copiedKey ? (
                                            <Check className="w-5 h-5 text-[#00E5FF]" />
                                        ) : (
                                            <Copy className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* API Secret */}
                            <div>
                                <label className="block text-xs text-gray-500 uppercase tracking-widest font-mono mb-2">
                                    API Secret
                                </label>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 px-4 py-3 bg-black border border-white/20 text-[#00E5FF] font-mono text-sm break-all">
                                        {generatedKey.apiSecret}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(generatedKey.apiSecret, 'secret')}
                                        className="p-3 border border-white/20 hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors"
                                    >
                                        {copiedSecret ? (
                                            <Check className="w-5 h-5 text-[#00E5FF]" />
                                        ) : (
                                            <Copy className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="border border-[#FF006E]/30 bg-[#FF006E]/5 p-4">
                                <p className="text-sm text-[#FF006E] font-mono uppercase tracking-wide">
                                    ⚠ This secret will only be shown once.
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Make sure to copy and securely store your API secret. You will not be able to retrieve it again.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={closeSecretModal}
                            className="w-full py-3 px-6 bg-[#00E5FF] text-black font-bold font-mono uppercase tracking-widest text-sm hover:brightness-110 transition-all duration-150"
                        >
                            I HAVE COPIED THE CREDENTIALS
                        </button>
                    </div>
                </div>
            )}

            {/* Reset Confirmation Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-[#0A0B0D] border-2 border-[#FF006E] max-w-xl w-full p-8 shadow-[0_0_40px_rgba(255,0,110,0.3)]">
                        <div className="flex items-center gap-3 mb-6">
                            <AlertTriangle className="w-6 h-6 text-[#FF006E]" />
                            <h2 className="text-xl font-bold font-mono uppercase tracking-wider text-white">
                                ARE YOU ABSOLUTELY SURE?
                            </h2>
                        </div>

                        <div className="space-y-6 mb-8">
                            <p className="text-sm text-gray-400">
                                This will wipe all trades and reset your balance to $100,000.
                            </p>

                            <div className="border border-[#FF006E]/30 bg-[#FF006E]/5 p-4">
                                <p className="text-xs text-[#FF006E] uppercase tracking-widest font-mono mb-3">
                                    Type "RESET" to confirm
                                </p>
                                <input
                                    type="text"
                                    value={resetConfirmText}
                                    onChange={(e) => setResetConfirmText(e.target.value)}
                                    className="w-full px-4 py-3 bg-black border border-[#FF006E] text-white font-mono text-sm focus:outline-none focus:shadow-[0_0_15px_rgba(255,0,110,0.3)] transition-all duration-200"
                                    placeholder="RESET"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setShowResetModal(false)
                                    setResetConfirmText('')
                                }}
                                className="flex-1 py-3 px-6 border border-white/20 text-white font-bold font-mono uppercase tracking-widest text-sm hover:bg-white/5 transition-all duration-150"
                                disabled={resetting}
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={resetAccount}
                                disabled={resetConfirmText !== 'RESET' || resetting}
                                className={`flex-1 py-3 px-6 font-bold font-mono uppercase tracking-widest text-sm transition-all duration-150 ${resetConfirmText === 'RESET' && !resetting
                                        ? 'bg-[#FF006E] text-black hover:shadow-[0_0_20px_rgba(255,0,110,0.6)]'
                                        : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                    }`}
                            >
                                {resetting ? 'RESETTING...' : 'CONFIRM RESET'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
