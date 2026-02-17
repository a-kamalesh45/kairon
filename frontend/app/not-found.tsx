"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Terminal, AlertTriangle } from 'lucide-react'

// Terminal diagnostic script
const DIAGNOSTIC_SCRIPT = [
    { text: '> INITIALIZING CONNECTION...', delay: 800 },
    { text: '> PING host... UNREACHABLE', delay: 1200 },
    { text: '> TRACING route... FAILED at hop 14', delay: 1000 },
    { text: '> ERROR_CODE: ASSET_DELISTED_OR_MOVED', delay: 1500, isError: true },
    { text: '> SIGNAL LOST.', delay: 500, isError: true }
]

export default function NotFoundPage() {
    const router = useRouter()
    const [displayedLines, setDisplayedLines] = useState<Array<{ text: string; isError?: boolean }>>([])
    const [currentLineIndex, setCurrentLineIndex] = useState(0)
    const [currentText, setCurrentText] = useState('')
    const [countdown, setCountdown] = useState(10)
    const [showGame, setShowGame] = useState(false)
    const [userInteracted, setUserInteracted] = useState(false)
    const [konamiBuffer, setKonamiBuffer] = useState<string[]>([])
    
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const countdownRef = useRef<NodeJS.Timeout | null>(null)

    // Konami code sequence
    const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

    // Terminal typewriter effect
    useEffect(() => {
        if (currentLineIndex >= DIAGNOSTIC_SCRIPT.length) {
            return
        }

        const currentLine = DIAGNOSTIC_SCRIPT[currentLineIndex]
        const targetText = currentLine.text
        let charIndex = 0

        intervalRef.current = setInterval(() => {
            if (charIndex < targetText.length) {
                setCurrentText(targetText.substring(0, charIndex + 1))
                charIndex++
            } else {
                clearInterval(intervalRef.current!)
                setDisplayedLines(prev => [...prev, { text: targetText, isError: currentLine.isError }])
                setCurrentText('')
                
                setTimeout(() => {
                    setCurrentLineIndex(prev => prev + 1)
                }, currentLine.delay)
            }
        }, 30)

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [currentLineIndex])

    // Auto-redirect countdown
    useEffect(() => {
        if (!userInteracted && currentLineIndex >= DIAGNOSTIC_SCRIPT.length) {
            countdownRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        router.push('/markets')
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current)
        }
    }, [currentLineIndex, userInteracted, router])

    // Konami code listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            setKonamiBuffer(prev => {
                const newBuffer = [...prev, e.key]
                if (newBuffer.length > KONAMI_CODE.length) {
                    newBuffer.shift()
                }
                
                // Check if matches Konami code
                if (newBuffer.length === KONAMI_CODE.length) {
                    const matches = newBuffer.every((key, i) => key === KONAMI_CODE[i])
                    if (matches) {
                        setShowGame(true)
                        setUserInteracted(true)
                        return []
                    }
                }
                
                return newBuffer
            })
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleReturnToDashboard = () => {
        setUserInteracted(true)
        // Clear stale state
        localStorage.removeItem('last_trade_symbol')
        router.push('/dashboard')
    }

    const handleRetryConnection = () => {
        setUserInteracted(true)
        router.back()
    }

    const handleEasterEggClick = () => {
        setShowGame(true)
        setUserInteracted(true)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ backgroundColor: '#000000' }}
        >
            {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 229, 255, 0.1) 2px, rgba(0, 229, 255, 0.1) 4px)'
                }}
            />

            {/* Main content */}
            <div className="relative z-10 w-full max-w-3xl">
                {/* Terminal Window */}
                <TerminalWindow
                    displayedLines={displayedLines}
                    currentText={currentText}
                    onEasterEggClick={handleEasterEggClick}
                />

                {/* Emergency Buttons */}
                {currentLineIndex >= DIAGNOSTIC_SCRIPT.length && (
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
                        <button
                            onClick={handleReturnToDashboard}
                            className="px-8 py-3 font-mono text-sm font-bold uppercase tracking-wider border-2 transition-all transform hover:scale-105"
                            style={{
                                backgroundColor: 'rgba(0, 229, 255, 0.1)',
                                borderColor: '#00E5FF',
                                color: '#00E5FF',
                                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                            }}
                        >
                            Return to Dashboard
                        </button>
                        
                        <button
                            onClick={handleRetryConnection}
                            className="px-8 py-3 font-mono text-sm font-bold uppercase tracking-wider border-2 transition-all hover:bg-white/5"
                            style={{
                                borderColor: 'rgba(0, 229, 255, 0.3)',
                                color: 'rgba(0, 229, 255, 0.7)'
                            }}
                        >
                            Retry Connection
                        </button>
                    </div>
                )}

                {/* Countdown Timer */}
                {!userInteracted && currentLineIndex >= DIAGNOSTIC_SCRIPT.length && countdown > 0 && (
                    <div className="mt-6 text-center font-mono text-sm animate-pulse"
                        style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                    >
                        Redirecting to /markets in {countdown}...
                    </div>
                )}
            </div>

            {/* Game Overlay */}
            {showGame && <GameOverlay onClose={() => setShowGame(false)} />}

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
                @keyframes glitch {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-2px); }
                    40% { transform: translateX(2px); }
                    60% { transform: translateX(-1px); }
                    80% { transform: translateX(1px); }
                }
                .glitch-effect {
                    animation: glitch 0.3s ease-in-out;
                }
            `}</style>
        </div>
    )
}

// Terminal Window Component
function TerminalWindow({
    displayedLines,
    currentText,
    onEasterEggClick
}: {
    displayedLines: Array<{ text: string; isError?: boolean }>
    currentText: string
    onEasterEggClick: () => void
}) {
    const [glitchError, setGlitchError] = useState(false)

    useEffect(() => {
        const hasError = displayedLines.some(line => line.isError)
        if (hasError && !glitchError) {
            setGlitchError(true)
            setTimeout(() => setGlitchError(false), 300)
        }
    }, [displayedLines, glitchError])

    return (
        <div className={`relative border-2 p-8 ${glitchError ? 'glitch-effect' : ''}`}
            style={{
                backgroundColor: '#000000',
                borderColor: '#00E5FF',
                boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)'
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Terminal size={20} style={{ color: '#00E5FF' }} />
                    <span className="font-mono text-sm font-bold" style={{ color: '#00E5FF' }}>
                        SYSTEM DIAGNOSTICS
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <AlertTriangle size={16} style={{ color: '#FF006E' }} />
                    <span className="font-mono text-xs" style={{ color: '#FF006E' }}>
                        SIGNAL LOST
                    </span>
                </div>
            </div>

            {/* Terminal Output */}
            <div className="font-mono text-sm space-y-2 min-h-50">
                {displayedLines.map((line, index) => (
                    <div
                        key={index}
                        className={line.isError ? 'animate-pulse' : ''}
                        style={{
                            color: line.isError ? '#FF006E' : '#00E5FF'
                        }}
                    >
                        {line.text}
                    </div>
                ))}
                {currentText && (
                    <div style={{ color: '#00E5FF' }}>
                        {currentText}
                        <span className="animate-pulse">▊</span>
                    </div>
                )}
            </div>

            {/* Hidden Easter Egg Trigger */}
            <button
                onClick={onEasterEggClick}
                className="absolute bottom-2 right-2 w-2 h-2 opacity-30 hover:opacity-100 transition-opacity animate-pulse"
                style={{ backgroundColor: '#00E5FF' }}
                aria-label="Hidden feature"
            />
        </div>
    )
}

// Game Overlay Component
function GameOverlay({ onClose }: { onClose: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [score, setScore] = useState(0)
    const [gameOver, setGameOver] = useState(false)
    const gameLoopRef = useRef<number | null>(null)

    // Snake game state
    const snake = useRef<Array<{ x: number; y: number }>>([{ x: 10, y: 10 }])
    const direction = useRef({ x: 1, y: 0 })
    const food = useRef({ x: 15, y: 15 })
    const gridSize = 20
    const tileSize = 20

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
                return
            }

            const key = e.key
            if (key === 'ArrowUp' && direction.current.y === 0) {
                direction.current = { x: 0, y: -1 }
            } else if (key === 'ArrowDown' && direction.current.y === 0) {
                direction.current = { x: 0, y: 1 }
            } else if (key === 'ArrowLeft' && direction.current.x === 0) {
                direction.current = { x: -1, y: 0 }
            } else if (key === 'ArrowRight' && direction.current.x === 0) {
                direction.current = { x: 1, y: 0 }
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        const gameLoop = () => {
            if (gameOver) return

            // Move snake
            const head = snake.current[0]
            const newHead = {
                x: head.x + direction.current.x,
                y: head.y + direction.current.y
            }

            // Check collision with walls
            if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
                setGameOver(true)
                return
            }

            // Check collision with self
            if (snake.current.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                setGameOver(true)
                return
            }

            snake.current.unshift(newHead)

            // Check if food eaten
            if (newHead.x === food.current.x && newHead.y === food.current.y) {
                setScore(prev => prev + 10)
                food.current = {
                    x: Math.floor(Math.random() * gridSize),
                    y: Math.floor(Math.random() * gridSize)
                }
            } else {
                snake.current.pop()
            }

            // Clear canvas
            ctx.fillStyle = '#000000'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Draw grid
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.1)'
            for (let i = 0; i <= gridSize; i++) {
                ctx.beginPath()
                ctx.moveTo(i * tileSize, 0)
                ctx.lineTo(i * tileSize, canvas.height)
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(0, i * tileSize)
                ctx.lineTo(canvas.width, i * tileSize)
                ctx.stroke()
            }

            // Draw snake
            ctx.fillStyle = '#00E5FF'
            snake.current.forEach((segment, index) => {
                ctx.fillRect(segment.x * tileSize + 1, segment.y * tileSize + 1, tileSize - 2, tileSize - 2)
                if (index === 0) {
                    ctx.fillStyle = '#00E5FF'
                } else {
                    ctx.fillStyle = 'rgba(0, 229, 255, 0.6)'
                }
            })

            // Draw food
            ctx.fillStyle = '#FF006E'
            ctx.fillRect(food.current.x * tileSize + 2, food.current.y * tileSize + 2, tileSize - 4, tileSize - 4)

            gameLoopRef.current = requestAnimationFrame(() => setTimeout(gameLoop, 100))
        }

        gameLoop()

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current)
            }
        }
    }, [gameOver, onClose])

    const handleRestart = () => {
        snake.current = [{ x: 10, y: 10 }]
        direction.current = { x: 1, y: 0 }
        food.current = { x: 15, y: 15 }
        setScore(0)
        setGameOver(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
            <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                    <div className="font-mono text-sm" style={{ color: '#00E5FF' }}>
                        SCORE: {score}
                    </div>
                    <button
                        onClick={onClose}
                        className="font-mono text-sm px-4 py-2 border transition-colors hover:bg-white/10"
                        style={{ borderColor: '#00E5FF', color: '#00E5FF' }}
                    >
                        ESC TO EXIT
                    </button>
                </div>
                
                <canvas
                    ref={canvasRef}
                    width={gridSize * tileSize}
                    height={gridSize * tileSize}
                    className="border-2"
                    style={{
                        borderColor: '#00E5FF',
                        boxShadow: '0 0 30px rgba(0, 229, 255, 0.5)'
                    }}
                />

                {gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <div className="text-center">
                            <div className="font-mono text-2xl mb-4" style={{ color: '#FF006E' }}>
                                GAME OVER
                            </div>
                            <div className="font-mono text-lg mb-6" style={{ color: '#00E5FF' }}>
                                FINAL SCORE: {score}
                            </div>
                            <button
                                onClick={handleRestart}
                                className="font-mono text-sm px-6 py-3 border-2 transition-all hover:scale-105"
                                style={{
                                    backgroundColor: 'rgba(0, 229, 255, 0.1)',
                                    borderColor: '#00E5FF',
                                    color: '#00E5FF'
                                }}
                            >
                                RESTART
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-4 text-center font-mono text-xs" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                    Use arrow keys to control • ESC to exit
                </div>
            </div>
        </div>
    )
}
