import React from 'react';
import "./globals.css"; // 👈 CRITICAL: This imports your Tailwind v4 Theme
import { ThemeProvider } from '@/components/ThemeProvider';

// Use a font that looks "techy" (Inter or standard sans works well with the theme)
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata = {
  title: 'KAIRON | High Frequency Trading Simulator',
  description: 'Institutional-grade market simulation engine.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} ${jetbrainsMono.variable} min-h-screen antialiased overflow-x-hidden`}
        style={{
          backgroundColor: 'var(--color-bg-app)',
          color: 'var(--color-text-primary)',
        }}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}