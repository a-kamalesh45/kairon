"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Search, Code, Zap, Activity, ChevronRight, Copy, Check, AlertCircle } from 'lucide-react'

interface Section {
    id: string
    title: string
    subsections?: Array<{ id: string; title: string }>
}

const SECTIONS: Section[] = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'authentication', title: 'Authentication' },
    {
        id: 'endpoints',
        title: 'Endpoints',
        subsections: [
            { id: 'post-order', title: 'POST /order' },
            { id: 'get-orders', title: 'GET /orders' },
            { id: 'post-cancel', title: 'POST /cancel' }
        ]
    },
    { id: 'websocket', title: 'WebSocket' }
]

type Language = 'python' | 'js' | 'curl'

export default function DocsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeSection, setActiveSection] = useState('introduction')
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    // Check if user is logged in
    useEffect(() => {
        const token = localStorage.getItem('kairon_token')
        setIsLoggedIn(!!token)
    }, [])

    // Global `/` hotkey for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
                e.preventDefault()
                searchInputRef.current?.focus()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Filter sections based on search
    const filteredSections = useMemo(() => {
        if (!searchQuery) return SECTIONS

        const query = searchQuery.toLowerCase()
        return SECTIONS.filter(section => {
            const titleMatch = section.title.toLowerCase().includes(query)
            const subsectionMatch = section.subsections?.some(sub =>
                sub.title.toLowerCase().includes(query)
            )
            return titleMatch || subsectionMatch
        })
    }, [searchQuery])

    // Scroll to section
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setActiveSection(id)
        }
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-app)' }}>
            <div className="flex">
                {/* Sidebar */}
                <DocsSidebar
                    sections={filteredSections}
                    activeSection={activeSection}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    searchInputRef={searchInputRef}
                    onNavigate={scrollToSection}
                />

                {/* Main Content */}
                <main className="flex-1 px-8 py-12 ml-80">
                    <div className="max-w-4xl">
                        <IntroductionSection />
                        <AuthenticationSection isLoggedIn={isLoggedIn} />
                        <EndpointsSection isLoggedIn={isLoggedIn} />
                        <WebSocketSection />
                    </div>
                </main>
            </div>
        </div>
    )
}

// Sidebar Component
function DocsSidebar({
    sections,
    activeSection,
    searchQuery,
    setSearchQuery,
    searchInputRef,
    onNavigate
}: {
    sections: Section[]
    activeSection: string
    searchQuery: string
    setSearchQuery: (query: string) => void
    searchInputRef: React.RefObject<HTMLInputElement | null>
    onNavigate: (id: string) => void
}) {
    return (
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 border-r overflow-y-auto"
            style={{
                backgroundColor: 'var(--color-bg-panel)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
        >
            <div className="p-6">
                {/* Search */}
                <div className="relative mb-8">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-tertiary)" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search docs... (press /)"
                        className="w-full pl-10 pr-4 py-2 text-sm border rounded bg-transparent transition-colors"
                        style={{
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'var(--color-text-primary)'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-accent-cyan)'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                    />
                    <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs rounded border"
                        style={{
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'var(--color-text-tertiary)'
                        }}
                    >
                        /
                    </kbd>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                    {sections.map((section) => (
                        <div key={section.id}>
                            <button
                                onClick={() => onNavigate(section.id)}
                                className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors relative ${activeSection === section.id
                                    ? 'text-(--color-accent-cyan)'
                                    : 'text-(--color-text-secondary) hover:text-(--color-text-primary)'
                                    }`}
                            >
                                {activeSection === section.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-(--color-accent-cyan)" />
                                )}
                                {section.title}
                            </button>

                            {/* Subsections */}
                            {section.subsections && (
                                <div className="ml-4 mt-1 space-y-1">
                                    {section.subsections.map((sub) => (
                                        <button
                                            key={sub.id}
                                            onClick={() => onNavigate(sub.id)}
                                            className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors ${activeSection === sub.id
                                                ? 'text-(--color-accent-cyan)'
                                                : 'text-(--color-text-tertiary) hover:text-(--color-text-secondary)'
                                                }`}
                                        >
                                            {sub.title}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>
        </aside>
    )
}

// Introduction Section
function IntroductionSection() {
    return (
        <section id="introduction" className="mb-16 scroll-mt-20">
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                KAIRON API Documentation
            </h1>
            <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Welcome to the KAIRON API. Build high-frequency trading applications with institutional-grade infrastructure.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <FeatureCard
                    icon={<Zap size={20} />}
                    title="Low Latency"
                    description="Sub-millisecond execution"
                />
                <FeatureCard
                    icon={<Activity size={20} />}
                    title="WebSocket Feeds"
                    description="Real-time market data"
                />
                <FeatureCard
                    icon={<Code size={20} />}
                    title="RESTful API"
                    description="Simple HTTP endpoints"
                />
            </div>

            <div className="p-6 border rounded" style={{
                backgroundColor: 'rgba(0, 229, 255, 0.05)',
                borderColor: 'rgba(0, 229, 255, 0.2)'
            }}>
                <h3 className="text-sm font-bold mb-2 text-(--color-accent-cyan)">Base URL</h3>
                <code className="font-mono text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    https://api.kairon.com/v1
                </code>
            </div>
        </section>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="p-4 border" style={{
            backgroundColor: 'var(--color-bg-panel)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
        }}>
            <div className="mb-2 text-(--color-accent-cyan)">{icon}</div>
            <h4 className="text-sm font-bold mb-1 text-(--color-text-primary)">{title}</h4>
            <p className="text-xs text-(--color-text-tertiary)">{description}</p>
        </div>
    )
}

// Authentication Section
function AuthenticationSection({ isLoggedIn }: { isLoggedIn: boolean }) {
    return (
        <section id="authentication" className="mb-16 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                Authentication
            </h2>

            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                All API requests require authentication using Bearer tokens. Include your API key in the Authorization header.
            </p>

            <CodeBlock
                code={`Authorization: Bearer YOUR_API_KEY`}
                language="text"
            />

            {!isLoggedIn && (
                <div className="mt-4 p-4 border rounded flex items-start gap-3" style={{
                    backgroundColor: 'rgba(255, 0, 110, 0.05)',
                    borderColor: 'rgba(255, 0, 110, 0.2)'
                }}>
                    <AlertCircle size={20} className="text-(--color-accent-pink) shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold mb-1 text-(--color-accent-pink)">Not Logged In</h4>
                        <p className="text-xs text-(--color-text-secondary)">
                            Log in to generate API keys and test endpoints directly from this page.
                        </p>
                    </div>
                </div>
            )}

            <RateLimitCalculator />
        </section>
    )
}

// Rate Limit Calculator
function RateLimitCalculator() {
    const [inputRate, setInputRate] = useState('')
    const [result, setResult] = useState<{ tier: string; color: string } | null>(null)

    const calculateLimit = (value: string) => {
        const rate = parseInt(value)
        if (isNaN(rate)) {
            setResult(null)
            return
        }

        if (rate <= 50) {
            setResult({ tier: 'Within Free Tier (50 req/min)', color: 'var(--color-accent-cyan)' })
        } else if (rate <= 500) {
            setResult({ tier: 'Requires Pro Plan (500 req/min)', color: 'var(--color-accent-orange)' })
        } else {
            setResult({ tier: 'Exceeds Pro Limit', color: 'var(--color-accent-pink)' })
        }
    }

    return (
        <div className="mt-8 p-6 border" style={{
            backgroundColor: 'var(--color-bg-panel)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
        }}>
            <h3 className="text-lg font-bold mb-4 text-(--color-text-primary)">Rate Limit Calculator</h3>
            <div className="flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-xs mb-2 text-(--color-text-secondary)">
                        Requests per minute
                    </label>
                    <input
                        type="number"
                        value={inputRate}
                        onChange={(e) => {
                            setInputRate(e.target.value)
                            calculateLimit(e.target.value)
                        }}
                        placeholder="e.g., 100"
                        className="w-full px-4 py-2 border rounded bg-transparent"
                        style={{
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'var(--color-text-primary)'
                        }}
                    />
                </div>
            </div>
            {result && (
                <div className="mt-4 p-3 border rounded" style={{
                    borderColor: result.color,
                    backgroundColor: `${result.color}10`
                }}>
                    <p className="text-sm font-mono" style={{ color: result.color }}>
                        {result.tier}
                    </p>
                </div>
            )}
        </div>
    )
}

// Endpoints Section
function EndpointsSection({ isLoggedIn }: { isLoggedIn: boolean }) {
    return (
        <section id="endpoints" className="mb-16 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                Endpoints
            </h2>

            <EndpointBlock
                id="post-order"
                method="POST"
                path="/order"
                description="Place a new order"
                isLoggedIn={isLoggedIn}
            />

            <EndpointBlock
                id="get-orders"
                method="GET"
                path="/orders"
                description="Retrieve open orders"
                isLoggedIn={isLoggedIn}
            />

            <EndpointBlock
                id="post-cancel"
                method="POST"
                path="/cancel"
                description="Cancel an existing order"
                isLoggedIn={isLoggedIn}
            />
        </section>
    )
}

// Endpoint Block
function EndpointBlock({
    id,
    method,
    path,
    description,
    isLoggedIn
}: {
    id: string
    method: string
    path: string
    description: string
    isLoggedIn: boolean
}) {
    const [language, setLanguage] = useState<Language>('js')

    const codeExamples = {
        python: `import requests

response = requests.${method.toLowerCase()}(
    "https://api.kairon.com/v1${path}",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={"symbol": "BTCUSDT", "side": "BUY", "qty": 1}
)
print(response.json())`,
        js: `fetch("https://api.kairon.com/v1${path}", {
    method: "${method}",
    headers: {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        symbol: "BTCUSDT",
        side: "BUY",
        qty: 1
    })
})
.then(res => res.json())
.then(data => console.log(data))`,
        curl: `curl -X ${method} https://api.kairon.com/v1${path} \\
    -H "Authorization: Bearer YOUR_API_KEY" \\
    -H "Content-Type: application/json" \\
    -d '{"symbol":"BTCUSDT","side":"BUY","qty":1}'`
    }

    return (
        <div id={id} className="mb-12 scroll-mt-20">
            <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 text-xs font-bold font-mono rounded" style={{
                    backgroundColor: method === 'POST' ? 'rgba(0, 229, 255, 0.2)' : 'rgba(138, 180, 248, 0.2)',
                    color: method === 'POST' ? 'var(--color-accent-cyan)' : '#8AB4F8'
                }}>
                    {method}
                </span>
                <code className="text-lg font-mono font-bold text-(--color-text-primary)">{path}</code>
            </div>

            <p className="mb-6 text-(--color-text-secondary)">{description}</p>

            {/* Code Switcher */}
            <div className="flex gap-2 mb-2">
                {(['python', 'js', 'curl'] as Language[]).map((lang) => (
                    <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`px-4 py-2 text-xs font-mono uppercase transition-colors ${language === lang
                            ? 'border-b-2'
                            : 'text-(--color-text-tertiary) hover:text-(--color-text-secondary)'
                            }`}
                        style={{
                            borderColor: language === lang ? 'var(--color-accent-cyan)' : 'transparent',
                            color: language === lang ? 'var(--color-accent-cyan)' : undefined
                        }}
                    >
                        {lang === 'js' ? 'JavaScript' : lang}
                    </button>
                ))}
            </div>

            <CodeBlock code={codeExamples[language]} language={language} />

            {/* API Playground */}
            <ApiPlayground
                method={method}
                path={path}
                isLoggedIn={isLoggedIn}
            />
        </div>
    )
}

// Code Block with Copy
function CodeBlock({ code, language }: { code: string; language: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="relative mb-6">
            <pre className="p-4 rounded overflow-x-auto text-sm font-mono" style={{
                backgroundColor: '#000000',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--color-text-primary)'
            }}>
                <code>{code}</code>
            </pre>
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 rounded transition-colors hover:bg-white/10"
                style={{ color: copied ? 'var(--color-accent-cyan)' : 'var(--color-text-tertiary)' }}
            >
                {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
        </div>
    )
}

// API Playground
function ApiPlayground({ method, path, isLoggedIn }: { method: string; path: string; isLoggedIn: boolean }) {
    const [requestBody, setRequestBody] = useState('{\n  "symbol": "BTCUSDT",\n  "side": "BUY",\n  "qty": 1\n}')
    const [response, setResponse] = useState<{ status: number; time: number; data: any } | null>(null)
    const [loading, setLoading] = useState(false)

    const executeRequest = async () => {
        if (!isLoggedIn) {
            alert('Please log in to test endpoints')
            return
        }

        setLoading(true)
        const startTime = performance.now()

        try {
            const token = localStorage.getItem('kairon_token')
            const res = await fetch(`/api${path}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: method !== 'GET' ? requestBody : undefined
            })

            const data = await res.json()
            const endTime = performance.now()

            setResponse({
                status: res.status,
                time: Math.round(endTime - startTime),
                data
            })
        } catch (error: any) {
            setResponse({
                status: 500,
                time: 0,
                data: { error: error.message }
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mt-6 p-6 border rounded" style={{
            backgroundColor: 'var(--color-bg-panel)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
        }}>
            <h4 className="text-sm font-bold mb-4 text-(--color-text-primary)">Try it out</h4>

            {method !== 'GET' && (
                <div className="mb-4">
                    <label className="block text-xs mb-2 text-(--color-text-secondary)">Request Body</label>
                    <textarea
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        className="w-full p-3 font-mono text-sm border rounded bg-black/50"
                        rows={6}
                        style={{
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'var(--color-text-primary)'
                        }}
                    />
                </div>
            )}

            <button
                onClick={executeRequest}
                disabled={loading || !isLoggedIn}
                className="px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider border-2 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                    backgroundColor: 'rgba(0, 229, 255, 0.1)',
                    borderColor: 'var(--color-accent-cyan)',
                    color: 'var(--color-accent-cyan)',
                    clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                }}
            >
                {loading ? 'Executing...' : 'Execute Request →'}
            </button>

            {response && (
                <div className="mt-6">
                    <div className="flex items-center gap-4 mb-3">
                        <span className="text-xs font-mono" style={{
                            color: response.status < 400 ? 'var(--color-accent-cyan)' : 'var(--color-accent-pink)'
                        }}>
                            Status: {response.status}
                        </span>
                        <span className="text-xs font-mono text-(--color-text-tertiary)">
                            {response.time}ms
                        </span>
                    </div>
                    <pre className="p-4 rounded overflow-x-auto text-sm font-mono max-h-96" style={{
                        backgroundColor: '#000000',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--color-text-primary)'
                    }}>
                        {JSON.stringify(response.data, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    )
}

// WebSocket Section
function WebSocketSection() {
    const [language, setLanguage] = useState<Language>('js')

    const wsExamples = {
        python: `import websocket
import json

def on_message(ws, message):
    data = json.loads(message)
    print(data)

ws = websocket.WebSocketApp(
    "wss://api.kairon.com/ws",
    header={"Authorization": "Bearer YOUR_API_KEY"},
    on_message=on_message
)

ws.run_forever()`,
        js: `const ws = new WebSocket("wss://api.kairon.com/ws")

ws.onopen = () => {
    // Subscribe to market data
    ws.send(JSON.stringify({
        action: "subscribe",
        channel: "trades",
        symbol: "BTCUSDT"
    }))
}

ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    console.log(data)
}`,
        curl: `# WebSocket connections require a WebSocket client
# Use wscat for testing:
wscat -c wss://api.kairon.com/ws \\
    -H "Authorization: Bearer YOUR_API_KEY"`
    }

    return (
        <section id="websocket" className="mb-16 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                WebSocket
            </h2>

            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Connect to real-time market data feeds using WebSocket connections. Authentication is required via the Authorization header.
            </p>

            <div className="p-6 border rounded mb-6" style={{
                backgroundColor: 'rgba(0, 229, 255, 0.05)',
                borderColor: 'rgba(0, 229, 255, 0.2)'
            }}>
                <h3 className="text-sm font-bold mb-2 text-(--color-accent-cyan)">WebSocket URL</h3>
                <code className="font-mono text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    wss://api.kairon.com/ws
                </code>
            </div>

            {/* Code Switcher */}
            <div className="flex gap-2 mb-2">
                {(['python', 'js', 'curl'] as Language[]).map((lang) => (
                    <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`px-4 py-2 text-xs font-mono uppercase transition-colors ${language === lang
                            ? 'border-b-2'
                            : 'text-(--color-text-tertiary) hover:text-(--color-text-secondary)'
                            }`}
                        style={{
                            borderColor: language === lang ? 'var(--color-accent-cyan)' : 'transparent',
                            color: language === lang ? 'var(--color-accent-cyan)' : undefined
                        }}
                    >
                        {lang === 'js' ? 'JavaScript' : lang}
                    </button>
                ))}
            </div>

            <CodeBlock code={wsExamples[language]} language={language} />

            <div className="p-6 border rounded" style={{
                backgroundColor: 'var(--color-bg-panel)',
                borderColor: 'rgba(255, 255, 255, 0.1)'
            }}>
                <h3 className="text-lg font-bold mb-4 text-(--color-text-primary)">Available Channels</h3>
                <div className="space-y-3">
                    <ChannelItem channel="trades" description="Real-time trade executions" />
                    <ChannelItem channel="orderbook" description="Order book depth updates" />
                    <ChannelItem channel="ticker" description="24h price statistics" />
                </div>
            </div>
        </section>
    )
}

function ChannelItem({ channel, description }: { channel: string; description: string }) {
    return (
        <div className="flex items-start gap-3">
            <code className="px-2 py-1 text-xs font-mono rounded" style={{
                backgroundColor: 'rgba(0, 229, 255, 0.1)',
                color: 'var(--color-accent-cyan)'
            }}>
                {channel}
            </code>
            <span className="text-sm text-(--color-text-secondary)">{description}</span>
        </div>
    )
}
