"use client"

import React, { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

try {
  var { useTheme } = require('./ThemeProvider')
} catch {
  var useTheme = null
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const theme = useTheme ? useTheme() : null

  useEffect(() => {
    setMounted(true)
  }, []);

  if (!mounted || !theme) {
    return (
      <button
        className="relative w-9 h-9 flex items-center justify-center rounded border border-theme-border bg-theme-panel hover:bg-theme-hover transition-all duration-300 group"
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="w-4 h-4 text-theme-text-primary" />
      </button>
    )
  }

  const { toggleTheme } = theme

  return (
    <button
      onClick={toggleTheme}
      className="relative w-9 h-9 flex items-center justify-center rounded border border-theme-border bg-theme-panel hover:bg-theme-hover transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      <Sun className="w-4 h-4 text-theme-text-primary absolute transition-all duration-300 rotate-0 scale-100 dark:rotate-90 dark:scale-0" />
      <Moon className="w-4 h-4 text-theme-text-primary absolute transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
    </button>
  )
}
