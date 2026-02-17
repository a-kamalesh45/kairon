export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen py-20 px-6">
            <div className="max-w-225 mx-auto space-y-12">
                {/* Header */}
                <header className="space-y-4 pb-8 border-b border-white/10">
                    <h1 className="text-4xl font-bold uppercase tracking-tight text-white">
                        Privacy Policy
                    </h1>
                    <p className="text-sm text-gray-500">
                        Last Updated: February 18, 2026
                    </p>
                </header>

                {/* Introduction */}
                <section className="space-y-4">
                    <p className="text-gray-400 leading-relaxed">
                        KAIRON (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our Platform.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        By using KAIRON, you consent to the data practices described in this policy.
                    </p>
                </section>

                {/* Data Collected */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        1. Data Collected
                    </h2>
                    <p className="text-sm uppercase text-gray-500 font-semibold">
                        Email Address
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        We collect your email address during registration for account identification and communication purposes. This is the only personally identifiable information we require.
                    </p>

                    <p className="text-sm uppercase text-gray-500 font-semibold mt-6">
                        API Usage Logs
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        We log API requests, including endpoint, timestamp, request method, and response status, to monitor system performance, detect abuse, and improve service reliability.
                    </p>

                    <p className="text-sm uppercase text-gray-500 font-semibold mt-6">
                        IP Address
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        IP addresses may be collected for security purposes, rate limiting, and fraud prevention. We do not use IP addresses for tracking or profiling.
                    </p>

                    <p className="text-sm uppercase text-gray-500 font-semibold mt-6">
                        Trading Activity Data
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        All simulated orders, trades, and portfolio data are stored to provide continuous service. This data is associated with your account but is not shared externally.
                    </p>
                </section>

                {/* WebSocket Data */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        2. WebSocket Data Handling
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        Real-time market data and order updates are transmitted via WebSocket connections. These connections are authenticated using session tokens and are encrypted in transit.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        WebSocket messages are not logged unless required for debugging or abuse investigation.
                    </p>
                </section>

                {/* Cookies & Local Storage */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        3. Cookies & Local Storage
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        KAIRON uses browser local storage to persist:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
                        <li>Authentication tokens (JWT)</li>
                        <li>User preferences (theme, last visited market)</li>
                        <li>API keys for client-side request signing</li>
                    </ul>
                    <p className="text-gray-400 leading-relaxed">
                        We do not use third-party tracking cookies or advertising pixels. All stored data remains on your device unless explicitly submitted to our servers via API calls.
                    </p>
                </section>

                {/* Data Retention */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        4. Data Retention
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        Account data, including email and trading history, is retained indefinitely unless you request deletion.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        API usage logs are retained for 90 days for security and performance analysis, after which they are purged.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        To request account deletion, contact us at <span className="font-mono text-[#00E5FF]">privacy@kairon.ai</span>. Deletion is permanent and cannot be reversed.
                    </p>
                </section>

                {/* Security Practices */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        5. Security Practices
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        We implement industry-standard security measures to protect your data:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
                        <li>All API connections use HTTPS/TLS encryption</li>
                        <li>Passwords are hashed using bcrypt with per-user salt</li>
                        <li>JWT tokens are signed and validated server-side</li>
                        <li>API keys are encrypted at rest using AES-256</li>
                        <li>Rate limiting prevents brute force attacks</li>
                    </ul>
                    <p className="text-gray-400 leading-relaxed">
                        While we take security seriously, no system is completely secure. You are responsible for safeguarding your credentials.
                    </p>
                </section>

                {/* Third-Party Services */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        6. Third-Party Services
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        KAIRON does not share your data with third-party advertisers or data brokers.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        We may use the following services for operational purposes:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
                        <li>Cloud hosting providers (infrastructure)</li>
                        <li>Email delivery services (transactional emails only)</li>
                        <li>Error monitoring tools (anonymized crash reports)</li>
                    </ul>
                    <p className="text-gray-400 leading-relaxed">
                        These services are bound by strict data processing agreements and do not have access to your personal data beyond what is necessary for service delivery.
                    </p>
                </section>

                {/* User Rights */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        7. User Rights
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        You have the right to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
                        <li><strong className="text-white">Access</strong> — Request a copy of your data</li>
                        <li><strong className="text-white">Correction</strong> — Update incorrect account information</li>
                        <li><strong className="text-white">Deletion</strong> — Request permanent account deletion</li>
                        <li><strong className="text-white">Portability</strong> — Export your trading data in JSON format</li>
                        <li><strong className="text-white">Objection</strong> — Opt out of non-essential communications</li>
                    </ul>
                    <p className="text-gray-400 leading-relaxed">
                        To exercise these rights, contact us at <span className="font-mono text-[#00E5FF]">privacy@kairon.ai</span> with your account email.
                    </p>
                </section>

                {/* Data Selling */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        8. No Data Selling
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        KAIRON does not sell, rent, or trade your personal information to third parties. Your data is used exclusively for operating and improving the Platform.
                    </p>
                </section>

                {/* Updates to Policy */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        9. Updates to This Policy
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &quot;Last Updated&quot; date.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        Continued use of the Platform after changes constitutes acceptance of the updated policy.
                    </p>
                </section>

                {/* Contact */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        Contact
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        For questions regarding this Privacy Policy or data practices, contact us at:
                    </p>
                    <p className="text-sm font-mono text-[#00E5FF]">
                        privacy@kairon.ai
                    </p>
                </section>
            </div>
        </div>
    )
}
