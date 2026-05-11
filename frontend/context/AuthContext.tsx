"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"

export interface AuthUser {
    id: string
    email: string
    username: string
    fullName: string
    balances: Record<string, { available: number; locked: number }>
}

interface AuthContextValue {
    user: AuthUser | null
    token: string | null
    isLoading: boolean
    login: (identifier: string, password: string, remember?: boolean) => Promise<void>
    register: (payload: RegisterPayload) => Promise<void>
    logout: () => void
}

interface RegisterPayload {
    fullName: string
    username: string
    email: string
    password: string
}

interface AuthResponse {
    success: boolean
    token: string
    user: {
        id: string
        email: string
        username?: string
        fullName?: string
        balances?: Record<string, { available?: number | string; locked?: number | string } | number | string>
    }
    message?: string
    error?: string
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_TOKEN_KEY = "kairon_token"
const STORAGE_USER_KEY = "kairon_user"

const normalizeBalances = (balances?: Record<string, { available?: number | string; locked?: number | string } | number | string>): Record<string, { available: number; locked: number }> => {
    if (!balances || typeof balances !== "object") return {}

    const normalized: Record<string, { available: number; locked: number }> = {}
    for (const [asset, value] of Object.entries(balances)) {
        if (typeof value === "number" || typeof value === "string") {
            const asNumber = Number(value)
            normalized[asset] = {
                available: Number.isFinite(asNumber) ? asNumber : 0,
                locked: 0
            }
            continue
        }

        const available = Number(value?.available ?? 0)
        const locked = Number(value?.locked ?? 0)
        normalized[asset] = {
            available: Number.isFinite(available) ? available : 0,
            locked: Number.isFinite(locked) ? locked : 0
        }
    }

    return normalized
}

const normalizeUser = (raw: AuthResponse["user"]): AuthUser => ({
    id: String(raw.id || ""),
    email: String(raw.email || ""),
    username: String(raw.username || ""),
    fullName: String(raw.fullName || ""),
    balances: normalizeBalances(raw.balances)
})

const parseStoredUser = (raw: string | null): AuthUser | null => {
    if (!raw) return null

    try {
        const parsed = JSON.parse(raw) as AuthResponse["user"]
        if (!parsed || typeof parsed !== "object") return null
        if (!parsed.id || !parsed.email) return null
        return normalizeUser(parsed)
    } catch {
        return null
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const saveSession = useCallback((payload: AuthResponse, persist: boolean) => {
        const normalizedUser = normalizeUser(payload.user)
        setUser(normalizedUser)
        setToken(payload.token)

        if (typeof window !== "undefined") {
            const storage = persist ? localStorage : sessionStorage
            storage.setItem(STORAGE_TOKEN_KEY, payload.token)
            storage.setItem(STORAGE_USER_KEY, JSON.stringify(normalizedUser))
        }
    }, [])

    const clearSession = useCallback(() => {
        setUser(null)
        setToken(null)

        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_TOKEN_KEY)
            localStorage.removeItem(STORAGE_USER_KEY)
            sessionStorage.removeItem(STORAGE_TOKEN_KEY)
            sessionStorage.removeItem(STORAGE_USER_KEY)
        }
    }, [])

    const requestAuth = useCallback(async (endpoint: string, body: Record<string, string>, persist: boolean) => {
        setIsLoading(true)
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            const data = (await res.json().catch(() => ({}))) as Partial<AuthResponse>

            if (!res.ok || !data || !data.token || !data.user) {
                const message = data?.error || data?.message || "Authentication failed"
                throw new Error(message)
            }

            if (data.success === false) {
                throw new Error(data.message || "Authentication failed")
            }

            saveSession(data as AuthResponse, persist)
        } finally {
            setIsLoading(false)
        }
    }, [saveSession])

    const login = useCallback(async (identifier: string, password: string, remember = true) => {
        await requestAuth("/api/auth/login", { identifier, password }, remember)
    }, [requestAuth])

    const register = useCallback(async (payload: RegisterPayload) => {
        await requestAuth("/api/auth/register", payload, true)
    }, [requestAuth])

    const logout = useCallback(() => {
        clearSession()
    }, [clearSession])

    useEffect(() => {
        if (typeof window === "undefined") {
            setIsLoading(false)
            return
        }

        const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY) || sessionStorage.getItem(STORAGE_TOKEN_KEY)
        const storedUser = parseStoredUser(localStorage.getItem(STORAGE_USER_KEY)) || parseStoredUser(sessionStorage.getItem(STORAGE_USER_KEY))

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(storedUser)
        }

        setIsLoading(false)
    }, [])

    const value = useMemo<AuthContextValue>(() => ({
        user,
        token,
        isLoading,
        login,
        register,
        logout
    }), [user, token, isLoading, login, register, logout])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
