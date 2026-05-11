import React from 'react';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CommandPalette } from '@/components/CommandPalette';
import { NotificationProvider } from '@/components/NotificationProvider';
import { GlobalNavbar } from '@/components/layout/GlobalNavbar';
import { GlobalFooter } from '@/components/layout/GlobalFooter';
import { AuthProvider } from '@/context/AuthContext';

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
        className={`${inter.className} ${jetbrainsMono.variable} min-h-screen antialiased overflow-x-hidden flex flex-col`}
        style={{
          backgroundColor: 'var(--color-bg-app)',
          color: 'var(--color-text-primary)',
        }}
      >
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <GlobalNavbar />
              <CommandPalette />
              <main className="pt-16 flex-1">
                {children}
              </main>
              <GlobalFooter />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}