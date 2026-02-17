"use client"

import Link from 'next/link'

export function GlobalFooter() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t border-white/10 bg-black/90 backdrop-blur-md mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <div className="text-lg font-bold text-white mb-2">KAIRON</div>
                        <p className="text-xs text-gray-500">
                            High Frequency Simulation Engine
                        </p>
                    </div>

                    {/* Platform */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase text-gray-400 mb-3">Platform</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/markets" className="text-sm text-gray-500 hover:text-[#00E5FF] transition-colors">
                                    Markets
                                </Link>
                            </li>
                            <li>
                                <Link href="/trade" className="text-sm text-gray-500 hover:text-[#00E5FF] transition-colors">
                                    Trade
                                </Link>
                            </li>
                            <li>
                                <Link href="/portfolio" className="text-sm text-gray-500 hover:text-[#00E5FF] transition-colors">
                                    Portfolio
                                </Link>
                            </li>
                            <li>
                                <Link href="/docs" className="text-sm text-gray-500 hover:text-[#00E5FF] transition-colors">
                                    API Docs
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase text-gray-400 mb-3">Legal</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/legal/terms" className="text-sm text-gray-500 hover:text-[#00E5FF] transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/privacy" className="text-sm text-gray-500 hover:text-[#00E5FF] transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* System */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase text-gray-400 mb-3">System</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/status" className="text-sm text-gray-500 hover:text-[#00E5FF] transition-colors">
                                    System Status
                                </Link>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/a-kamalesh45/kairon"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-gray-500 hover:text-[#00E5FF] transition-colors"
                                >
                                    GitHub
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-600">
                        © {currentYear} KAIRON. Simulation Platform Only.
                    </p>
                    <p className="text-xs text-gray-600">
                        No real financial execution. Educational purposes.
                    </p>
                </div>
            </div>
        </footer>
    )
}
