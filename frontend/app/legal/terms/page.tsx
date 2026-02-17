export default function TermsOfService() {
    return (
        <div className="min-h-screen py-20 px-6">
            <div className="max-w-225 mx-auto space-y-12">
                {/* Header */}
                <header className="space-y-4 pb-8 border-b border-white/10">
                    <h1 className="text-4xl font-bold uppercase tracking-tight text-white">
                        Terms of Service
                    </h1>
                    <p className="text-sm text-gray-500">
                        Last Updated: February 18, 2026
                    </p>
                </header>

                {/* Introduction */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold uppercase text-white">
                        1. Introduction
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        KAIRON (&quot;Platform&quot;, &quot;Service&quot;, &quot;we&quot;, &quot;us&quot;) is a high-frequency trading simulation engine designed for educational and research purposes. By accessing or using this Platform, you (&quot;User&quot;, &quot;you&quot;) agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use this Service.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        This Platform does not execute real financial transactions. All orders, trades, and market data are simulated.
                    </p>
                </section>

                {/* Eligibility */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        2. Eligibility
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        You must be at least 18 years old to use this Platform. By registering, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        Users from jurisdictions where trading simulation platforms are restricted or prohibited are not permitted to access this Service.
                    </p>
                </section>

                {/* Simulation Disclaimer */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        3. Simulation Disclaimer
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        KAIRON is a simulation platform only. No real financial assets are traded, exchanged, or held. All market prices, order books, and execution results are generated algorithmically for educational purposes.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        Simulated performance does not guarantee real-world results. Market conditions, slippage, latency, and execution quality in live trading environments differ significantly from simulation.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        You acknowledge that you will not hold KAIRON liable for any decisions made based on simulated data or outcomes.
                    </p>
                </section>

                {/* Risk Disclosure */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        4. Risk Disclosure
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        While this Platform does not involve real financial risk, users should understand that real high-frequency trading involves substantial risk of loss. Leverage, margin, and automated trading strategies can result in significant capital loss.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        This Platform is not financial advice. Do not use simulation results to make real trading decisions without consulting a licensed financial advisor.
                    </p>
                </section>

                {/* API Usage Policy */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        5. API Usage Policy
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        Users are granted access to the KAIRON REST and WebSocket APIs for legitimate simulation and development purposes.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        API keys are personal and non-transferable. You are responsible for securing your credentials. Any activity conducted using your API keys is your responsibility.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        You may not:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
                        <li>Reverse engineer or decompile the Platform</li>
                        <li>Attempt to gain unauthorized access to systems or data</li>
                        <li>Distribute, sublicense, or resell API access</li>
                        <li>Use the Platform for illegal activity or market manipulation simulation</li>
                    </ul>
                </section>

                {/* Rate Limits */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        6. Rate Limits & Abuse
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        API requests are subject to rate limits to ensure fair access and system stability. Excessive requests may result in temporary or permanent account suspension.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        Abuse of the Platform, including but not limited to DDoS attacks, spam, or exploitative behavior, will result in immediate termination without notice.
                    </p>
                </section>

                {/* Termination */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        7. Termination of Access
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        KAIRON reserves the right to suspend or terminate your account at any time, with or without cause, and without prior notice. Reasons for termination may include, but are not limited to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-400 ml-4">
                        <li>Violation of these Terms</li>
                        <li>Suspected fraudulent or abusive activity</li>
                        <li>Extended inactivity</li>
                        <li>Legal or regulatory requirements</li>
                    </ul>
                    <p className="text-gray-400 leading-relaxed">
                        Upon termination, all API keys will be revoked, and access to the Platform will be disabled.
                    </p>
                </section>

                {/* Limitation of Liability */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        8. Limitation of Liability
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        KAIRON is provided &quot;as is&quot; without warranties of any kind, express or implied. We do not guarantee uninterrupted service, accuracy of simulated data, or error-free operation.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        To the maximum extent permitted by law, KAIRON and its operators shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of the Platform.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        This includes, but is not limited to, loss of data, loss of profit, or any other commercial damages or losses.
                    </p>
                </section>

                {/* Governing Law */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        9. Governing Law
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which KAIRON operates, without regard to its conflict of law provisions.
                    </p>
                    <p className="text-gray-400 leading-relaxed">
                        Any disputes arising from these Terms or your use of the Platform shall be resolved through binding arbitration, except where prohibited by law.
                    </p>
                </section>

                {/* Contact */}
                <section className="space-y-4 pt-8 border-t border-white/10">
                    <h2 className="text-xl font-bold uppercase text-white">
                        Contact
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                        For questions regarding these Terms, contact us at:
                    </p>
                    <p className="text-sm font-mono text-[#00E5FF]">
                        legal@kairon.ai
                    </p>
                </section>
            </div>
        </div>
    )
}
