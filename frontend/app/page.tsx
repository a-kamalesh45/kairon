"use client"

import React from "react"
import Link from "next/link"
import dynamic from "next/dynamic" // 1. Import dynamic
import { ArrowRight, Shield, Cpu, Activity, Terminal, Network, Database, Code2, Zap } from "lucide-react"

// Import your components
import { StockTicker } from "@/components/LandingPage/Ticker"
import { ThemeToggle } from "@/components/ThemeToggle"

// 2. Load the Globe ONLY on the client (Browser)
// This fixes "window is not defined" because the server ignores this file.
const Globe = dynamic(() => import("@/components/LandingPage/Globe").then((m) => m.Globe), {
  ssr: false
});

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>

      {/* 1. TOP TICKER (The Pulse) */}
      <div className="relative z-50">
        <StockTicker />
      </div>

      {/* 2. NAVIGATION */}
      <nav className="fixed w-full top-12 z-40 border-b border-theme-border backdrop-blur-md" style={{ backgroundColor: 'var(--color-bg-app)' + 'cc' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative w-8 h-8 flex items-center justify-center bg-theme-bg-panel border border-theme-border rounded overflow-hidden group-hover:border-theme-border-hover transition-colors">
              <Terminal className="w-4 h-4 text-theme-text-primary" />
            </div>
            <span className="text-xl font-bold tracking-widest text-theme-text-primary">KAIRON</span>
          </div>

          {/* Links */}
          <div className="hidden md:flex gap-8 text-xs font-mono text-theme-text-secondary">
            <Link href="/" className="hover:text-theme-neon-cyan transition-colors">HOME</Link>
            <Link href="/markets" className="hover:text-theme-neon-cyan transition-colors">MARKETS</Link>
            <Link href="/trade" className="hover:text-theme-neon-cyan transition-colors">TRADE</Link>
          </div>

          {/* CTA & Theme Toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/trade">
              <button className="px-5 py-2 text-xs font-bold font-mono border border-theme-neon-cyan text-theme-text-primary transition-all rounded uppercase tracking-wider" style={{ backgroundColor: 'var(--color-neon-cyan)' }}>
                Launch Terminal
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 3. HERO SECTION */}
      <main className="relative pt-28 pb-16 px-6 min-h-screen flex items-center">

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT COLUMN: The Typography (Data) */}
          <div className="relative z-10 text-left space-y-6">

            {/* System Status - Live Telemetry */}
            <div className="inline-flex items-center gap-3 px-4 py-2.5 border border-theme-accent bg-theme-panel font-mono w-fit" style={{ boxShadow: '0 0 1px var(--color-accent-primary)' }}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 bg-theme-accent"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-theme-accent"></span>
              </span>
              <span className="text-[11px] tracking-[0.2em] text-theme-primary font-medium">SYSTEM ONLINE</span>
              <span className="text-[11px] tracking-widest text-theme-accent font-bold">15ms</span>
            </div>

            {/* Headline - Reduced 12% for Balance */}
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-theme-primary mt-2">
              SEIZE THE<br />
              MICROSECOND
            </h1>

            {/* Subheading - Authority + Technical Proof */}
            <div className="max-w-lg space-y-1">
              <p className="text-base text-theme-primary font-medium leading-tight">
                Institutional-grade HFT simulator.
              </p>
              <p className="text-sm text-theme-secondary font-normal leading-snug">
                Deploy C++ algorithms to a deterministic matching engine. Kafka event sourcing. Microsecond-accurate execution.
              </p>
            </div>

            {/* CTA Hierarchy - Single Dominant Action */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {/* PRIMARY CTA - Execution Signal */}
              <Link href="/trade">
                <button className="group px-10 py-4 bg-theme-accent text-black font-bold text-sm uppercase tracking-[0.2em] hover:bg-theme-accent-hover transition-colors w-full sm:w-auto">
                  Launch Terminal
                  <ArrowRight className="inline ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>

              {/* SECONDARY CTA - Outline Only */}
              <button className="px-8 py-4 border border-theme text-theme-secondary text-xs uppercase tracking-widest hover:border-theme-hover hover:text-theme-primary transition-all font-mono w-full sm:w-auto">
                View Documentation
              </button>
            </div>

            {/* Metrics - Instrumentation Strip */}
            <div className="grid grid-cols-3 gap-8 pt-6 border-t border-theme mt-4">
              <div className="flex flex-col items-start gap-1">
                <div className="text-3xl font-bold font-mono text-theme-primary tabular-nums leading-none">150k<span className="text-theme-tertiary text-lg">/s</span></div>
                <div className="text-[9px] font-mono text-theme-tertiary uppercase tracking-[0.2em]">THROUGHPUT</div>
              </div>
              <div className="flex flex-col items-start gap-1">
                <div className="text-3xl font-bold font-mono text-theme-primary tabular-nums leading-none">50<span className="text-theme-accent text-lg">µs</span></div>
                <div className="text-[9px] font-mono text-theme-tertiary uppercase tracking-[0.2em]">LATENCY</div>
              </div>
              <div className="flex flex-col items-start gap-1">
                <div className="text-3xl font-bold font-mono text-theme-primary leading-none">C++20</div>
                <div className="text-[9px] font-mono text-theme-tertiary uppercase tracking-[0.2em]">ENGINE</div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Globe (Enhanced) */}
          <div className="relative h-150 w-full hidden lg:flex items-center justify-end">
            {/* Subtle computational glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 bg-theme-accent opacity-[0.02] blur-[100px] rounded-full pointer-events-none"></div>

            {/* Globe with enhanced visibility */}
            <div className="relative w-[650px] h-[650px] opacity-70 lg:-mr-32" style={{
              filter: 'contrast(1.2) brightness(1.1)',
            }}>
              <Globe />
            </div>
          </div>

        </div>
      </main>

      {/* 4. PRESSURE POINT - Credibility Lock */}
      <section className="py-20 px-6 border-y border-theme">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl md:text-3xl font-bold text-theme-primary tracking-tight leading-tight font-mono">
            Deterministic. Auditable. Microsecond-accurate.
          </p>
        </div>
      </section>

      {/* 5. FEATURE GRID (Systems Engineering) */}
      <section className="py-24 px-6 bg-theme-panel">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Cpu className="w-7 h-7 text-theme-primary" />}
            title="Hybrid Architecture"
            desc="C++ Limit Order Book wrapped in Node.js event loop. 0.05ms execution."
          />
          <FeatureCard
            icon={<Activity className="w-7 h-7 text-theme-accent" />}
            title="Event Sourcing"
            desc="Kafka write-ahead logs. Atomic state reconstruction after any crash."
          />
          <FeatureCard
            icon={<Shield className="w-7 h-7 text-theme-secondary" />}
            title="Distributed State"
            desc="Redis Pub/Sub decouples UI from matching engine. Real-time synchronization."
          />
        </div>
      </section>

      {/* 6. SUPPORTED ASSETS & MARKETS */}
      <section className="py-20 px-6 border-t border-theme">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xs font-mono text-theme-tertiary uppercase tracking-[0.25em] mb-12">Supported Assets</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Majors */}
            <div>
              <div className="text-[10px] font-mono text-theme-tertiary uppercase tracking-widest mb-4 border-b border-theme pb-2">Majors</div>
              <div className="space-y-2.5">
                <AssetRow symbol="BTC" name="Bitcoin" />
                <AssetRow symbol="ETH" name="Ethereum" />
                <AssetRow symbol="BNB" name="BNB" />
              </div>
            </div>

            {/* Layer 1 */}
            <div>
              <div className="text-[10px] font-mono text-theme-tertiary uppercase tracking-widest mb-4 border-b border-theme pb-2">Layer 1</div>
              <div className="space-y-2.5">
                <AssetRow symbol="SOL" name="Solana" />
                <AssetRow symbol="ADA" name="Cardano" />
                <AssetRow symbol="AVAX" name="Avalanche" />
              </div>
            </div>

            {/* Stablecoins */}
            <div>
              <div className="text-[10px] font-mono text-theme-tertiary uppercase tracking-widest mb-4 border-b border-theme pb-2">Stablecoins</div>
              <div className="space-y-2.5">
                <AssetRow symbol="USDT" name="Tether" />
                <AssetRow symbol="USDC" name="USD Coin" />
                <AssetRow symbol="DAI" name="Dai" />
              </div>
            </div>

            {/* DeFi */}
            <div>
              <div className="text-[10px] font-mono text-theme-tertiary uppercase tracking-widest mb-4 border-b border-theme pb-2">DeFi</div>
              <div className="space-y-2.5">
                <AssetRow symbol="UNI" name="Uniswap" />
                <AssetRow symbol="AAVE" name="Aave" />
                <AssetRow symbol="LINK" name="Chainlink" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MARKET DATA FIDELITY */}
      <section className="py-20 px-6 bg-theme-panel border-y border-theme">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xs font-mono text-theme-tertiary uppercase tracking-[0.25em] mb-12">Market Data Fidelity</h2>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-8">
            <FidelityPoint text="Deterministic event ordering" />
            <FidelityPoint text="Historical market replay" />
            <FidelityPoint text="Microsecond-accurate execution" />
            <FidelityPoint text="No randomized fills" />
            <FidelityPoint text="Tick-by-tick reconstruction" />
            <FidelityPoint text="Order book state consistency" />
          </div>
        </div>
      </section>

      {/* 8. SIMULATION CAPABILITIES */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xs font-mono text-theme-tertiary uppercase tracking-[0.25em] mb-12">Simulation Capabilities</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CapabilityCard
              icon={<Database className="w-6 h-6" />}
              title="Order Book Stress Testing"
              desc="High-frequency load scenarios"
            />
            <CapabilityCard
              icon={<Zap className="w-6 h-6" />}
              title="Latency Arbitrage"
              desc="Cross-exchange timing analysis"
            />
            <CapabilityCard
              icon={<Activity className="w-6 h-6" />}
              title="Slippage Modeling"
              desc="Execution under volume pressure"
            />
            <CapabilityCard
              icon={<Terminal className="w-6 h-6" />}
              title="Strategy Failure Analysis"
              desc="Edge case detection and logging"
            />
          </div>
        </div>
      </section>

      {/* 9. ARCHITECTURE OVERVIEW */}
      <section className="py-20 px-6 bg-theme-panel border-y border-theme">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs font-mono text-theme-tertiary uppercase tracking-[0.25em] mb-16">Architecture Overview</h2>

          <div className="space-y-3">
            <ArchitectureLayer
              label="Market Data Ingestion"
              tech="WebSocket → Kafka Producers"
            />
            <ArchitectureLayer
              label="Matching Engine"
              tech="C++20 Order Book + LMAX Disruptor"
            />
            <ArchitectureLayer
              label="Event Log"
              tech="Kafka Topics (partitioned by symbol)"
            />
            <ArchitectureLayer
              label="Distributed State"
              tech="Redis Pub/Sub + Materialized Views"
            />
            <ArchitectureLayer
              label="API Layer"
              tech="REST + WebSocket (Node.js)"
            />
          </div>
        </div>
      </section>

      {/* 10. INTERFACES & INTEGRATION */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xs font-mono text-theme-tertiary uppercase tracking-[0.25em] mb-12">Interfaces & Integration</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <InterfaceCard
              icon={<Code2 className="w-6 h-6" />}
              title="REST API"
              items={["Order submission", "Position queries", "Historical fills", "System metrics"]}
            />
            <InterfaceCard
              icon={<Network className="w-6 h-6" />}
              title="WebSocket Feeds"
              items={["Real-time order book", "Trade stream", "Execution updates", "System events"]}
            />
            <InterfaceCard
              icon={<Terminal className="w-6 h-6" />}
              title="Terminal Access"
              items={["CLI order entry", "Live monitoring", "Event log queries", "Performance profiling"]}
            />
          </div>
        </div>
      </section>

      {/* 11. USE CASES */}
      <section className="py-20 px-6 bg-theme-panel border-y border-theme">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xs font-mono text-theme-tertiary uppercase tracking-[0.25em] mb-12">Use Cases</h2>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-6">
            <UseCase title="Quant Research" desc="Backtest HFT strategies against historical market conditions" />
            <UseCase title="Education & Experimentation" desc="Learn market microstructure without capital risk" />
            <UseCase title="Strategy Prototyping" desc="Iterate on algorithm logic before live deployment" />
            <UseCase title="Failure Analysis" desc="Identify edge cases and failure modes under stress" />
          </div>
        </div>
      </section>

      {/* 12. FINAL CREDIBILITY STATEMENT */}
      <section className="py-24 px-6 border-t border-theme">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl md:text-2xl font-mono text-theme-primary tracking-tight leading-tight">
            Deterministic systems outperform intuition.
          </p>
        </div>
      </section>
    </div>
  )
}

/* --- SUB COMPONENTS --- */

function AssetRow({ symbol, name }: { symbol: string; name: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-mono text-theme-primary font-bold">{symbol}</span>
      <span className="text-[10px] font-mono text-theme-tertiary">{name}</span>
    </div>
  )
}

function FidelityPoint({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-1 h-1 bg-theme-accent mt-2 shrink-0"></div>
      <span className="text-sm font-mono text-theme-secondary">{text}</span>
    </div>
  )
}

function CapabilityCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="border border-theme bg-theme-panel p-5">
      <div className="text-theme-accent mb-3">{icon}</div>
      <h3 className="text-xs font-mono text-theme-primary font-bold mb-2 uppercase tracking-wide">{title}</h3>
      <p className="text-[11px] font-mono text-theme-tertiary leading-relaxed">{desc}</p>
    </div>
  )
}

function ArchitectureLayer({ label, tech }: { label: string; tech: string }) {
  return (
    <div className="flex items-center border-l-2 border-theme-accent bg-theme-panel px-6 py-4">
      <div className="flex-1">
        <div className="text-xs font-mono text-theme-primary font-bold mb-0.5">{label}</div>
        <div className="text-[10px] font-mono text-theme-tertiary">{tech}</div>
      </div>
      <div className="text-theme-tertiary text-xs">→</div>
    </div>
  )
}

function InterfaceCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="border border-theme bg-theme-panel p-6">
      <div className="text-theme-accent mb-4">{icon}</div>
      <h3 className="text-sm font-mono text-theme-primary font-bold mb-4 uppercase tracking-wide">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-[11px] font-mono text-theme-secondary flex items-start gap-2">
            <span className="text-theme-tertiary">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function UseCase({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-mono text-theme-primary font-bold">{title}</h3>
      <p className="text-xs font-mono text-theme-tertiary leading-relaxed">{desc}</p>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-6 border border-theme bg-theme-panel hover:border-theme-hover transition-colors group">
      <div className="mb-5 p-3 bg-theme-hover inline-flex border-l-2 border-theme-accent">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-theme-primary mb-2.5 font-mono tracking-tight">{title}</h3>
      <p className="text-theme-secondary leading-snug text-xs">{desc}</p>
    </div>
  )
}