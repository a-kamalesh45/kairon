import React from 'react';
import { cn } from '@/lib/utils';

interface Stock {
  symbol: string;
  price: string;
  change: string;
  isUp: boolean;
}

const STOCKS: Stock[] = [
  { symbol: "BTC", price: "64,230", change: "+4.1%", isUp: true },
  { symbol: "ETH", price: "3,450", change: "+3.2%", isUp: true },
  { symbol: "SOL", price: "145.20", change: "-1.2%", isUp: false },
  { symbol: "NVDA", price: "890.15", change: "+2.8%", isUp: true },
  { symbol: "TSLA", price: "175.30", change: "-0.5%", isUp: false },
  { symbol: "KAIRON", price: "1,024.00", change: "+12.5%", isUp: true }, // Easter Egg
];

export function StockTicker() {
  return (
    <div className="w-full backdrop-blur-md border-y overflow-hidden py-3 select-none" style={{ backgroundColor: 'var(--color-bg-app)' + 'CC', borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="flex animate-scroll whitespace-nowrap">
        {[...STOCKS, ...STOCKS].map((stock, i) => (
          <div key={i} className="flex items-center gap-3 mx-8 text-sm font-mono">
            <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{stock.symbol}</span>
            <span className="tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>{stock.price}</span>
            <span
              className={cn(
                "text-xs font-medium tabular-nums",
                stock.isUp
                  ? "text-(--color-neon-cyan)"
                  : "text-(--color-neon-pink)"
              )}
            >
              {stock.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}