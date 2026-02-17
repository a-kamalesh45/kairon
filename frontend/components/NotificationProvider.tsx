"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"

type NotificationType = "SUCCESS" | "ERROR" | "INFO"

interface Notification {
    id: string
    type: NotificationType
    message: string
}

interface NotificationContextType {
    addNotification: (notification: Omit<Notification, "id">) => void
    removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error("useNotifications must be used within NotificationProvider")
    }
    return context
}

// Toast Item Component
const ToastItem = React.memo(({ 
    notification, 
    onRemove 
}: { 
    notification: Notification
    onRemove: (id: string) => void 
}) => {
    const [isExiting, setIsExiting] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [remainingTime, setRemainingTime] = useState(5000)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const startTimeRef = useRef<number>(Date.now())

    const handleRemove = useCallback(() => {
        setIsExiting(true)
        setTimeout(() => onRemove(notification.id), 200)
    }, [notification.id, onRemove])

    // Auto-dismiss logic with pause on hover
    useEffect(() => {
        if (isPaused) {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
                const elapsed = Date.now() - startTimeRef.current
                setRemainingTime(prev => Math.max(0, prev - elapsed))
            }
            return
        }

        startTimeRef.current = Date.now()
        timerRef.current = setTimeout(handleRemove, remainingTime)

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [isPaused, remainingTime, handleRemove])

    const typeConfig = {
        SUCCESS: {
            icon: CheckCircle2,
            borderColor: "border-[#00E5FF]",
            textColor: "text-[#00E5FF]",
            bgColor: "bg-[#00E5FF]/5",
            glowColor: "shadow-[0_0_10px_rgba(0,229,255,0.3)]"
        },
        ERROR: {
            icon: AlertCircle,
            borderColor: "border-[#FF006E]",
            textColor: "text-[#FF006E]",
            bgColor: "bg-[#FF006E]/5",
            glowColor: "shadow-[0_0_10px_rgba(255,0,110,0.3)]"
        },
        INFO: {
            icon: Info,
            borderColor: "border-[#0066FF]",
            textColor: "text-[#0066FF]",
            bgColor: "bg-[#0066FF]/5",
            glowColor: "shadow-[0_0_10px_rgba(0,102,255,0.3)]"
        }
    }

    const config = typeConfig[notification.type]
    const IconComponent = config.icon

    return (
        <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className={`
                w-full max-w-87.5 bg-black border ${config.borderColor} ${config.glowColor}
                px-4 py-3 flex items-start gap-3
                transition-all duration-200 ease-out
                ${isExiting ? 'opacity-0 translate-x-96' : 'opacity-100 translate-x-0'}
                ${isPaused ? 'scale-[1.02]' : 'scale-100'}
            `}
            style={{
                animation: isExiting ? '' : 'slideInFromRight 200ms ease-out'
            }}
        >
            {/* Icon */}
            <div className={`${config.bgColor} p-1.5 ${config.borderColor} border`}>
                <IconComponent className={`w-4 h-4 ${config.textColor}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className={`text-xs font-mono uppercase tracking-wider mb-1 ${config.textColor}`}>
                    {notification.type}
                </div>
                <div className="text-sm text-white font-mono">
                    {notification.message}
                </div>
            </div>

            {/* Close Button */}
            <button
                onClick={handleRemove}
                className="text-gray-500 hover:text-white transition-colors duration-150 p-1"
            >
                <X className="w-4 h-4" />
            </button>

            <style jsx>{`
                @keyframes slideInFromRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    )
})

ToastItem.displayName = "ToastItem"

// Notification Provider Component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const wsRef = useRef<WebSocket | null>(null)

    const addNotification = useCallback((notification: Omit<Notification, "id">) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newNotification = { ...notification, id }

        setNotifications(prev => {
            const updated = [newNotification, ...prev]
            // Max 5 notifications visible at once
            return updated.slice(0, 5)
        })
    }, [])

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }, [])

    // WebSocket connection for real-time notifications
    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem("kairon_token")
        if (!token) return

        // Simulated WebSocket connection
        // In production, replace with: wss://your-backend/ws/user-events
        const simulateWebSocket = () => {
            // Example: Simulate random notifications for demo purposes
            // Remove this in production and use real WebSocket
            const eventTypes: NotificationType[] = ["SUCCESS", "ERROR", "INFO"]
            const messages = {
                SUCCESS: [
                    "Order Filled: BTCUSDT @ 43250",
                    "Position Opened: ETHUSD Long x5",
                    "Stop Loss Triggered: +$420.50",
                    "Deposit Confirmed: 5000 USDT"
                ],
                ERROR: [
                    "Insufficient Funds: Order Cancelled",
                    "API Rate Limit Exceeded",
                    "Connection Lost: Retrying...",
                    "Invalid Order Size"
                ],
                INFO: [
                    "System Maintenance in 5 minutes",
                    "New Market Added: SOLUSD",
                    "Trading Fees Reduced to 0.08%",
                    "Price Alert: BTC > $45000"
                ]
            }

            // Simulate event every 15-30 seconds (for demo only)
            const interval = setInterval(() => {
                const type = eventTypes[Math.floor(Math.random() * eventTypes.length)]
                const messageList = messages[type]
                const message = messageList[Math.floor(Math.random() * messageList.length)]
                
                addNotification({ type, message })
            }, 20000) // 20 seconds

            return () => clearInterval(interval)
        }

        // Use simulated WebSocket for now
        // In production, uncomment below and remove simulateWebSocket:
        /*
        try {
            const ws = new WebSocket(`wss://your-backend/ws/user-events?token=${token}`)
            
            ws.onopen = () => {
                console.log("[NotificationProvider] WebSocket connected")
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    if (data.type && data.message) {
                        addNotification({
                            type: data.type,
                            message: data.message
                        })
                    }
                } catch (error) {
                    console.error("[NotificationProvider] Invalid WebSocket message:", error)
                }
            }

            ws.onerror = (error) => {
                console.error("[NotificationProvider] WebSocket error:", error)
            }

            ws.onclose = () => {
                console.log("[NotificationProvider] WebSocket disconnected")
            }

            wsRef.current = ws

            return () => {
                ws.close()
            }
        } catch (error) {
            console.error("[NotificationProvider] Failed to connect WebSocket:", error)
        }
        */

        const cleanup = simulateWebSocket()
        return cleanup
    }, [addNotification])

    return (
        <NotificationContext.Provider value={{ addNotification, removeNotification }}>
            {children}
            
            {/* Notification Container - Top Right */}
            {notifications.length > 0 && (
                <div className="fixed top-4 right-4 z-10000 flex flex-col gap-4 pointer-events-none">
                    <div className="flex flex-col gap-4 pointer-events-auto">
                        {notifications.map(notification => (
                            <ToastItem
                                key={notification.id}
                                notification={notification}
                                onRemove={removeNotification}
                            />
                        ))}
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    )
}
