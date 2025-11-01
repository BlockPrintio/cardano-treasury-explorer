import { ArrowUpRight } from "lucide-react";

import type { TreasuryStats } from "@/types/treasury";

interface HeroProps {
  stats?: TreasuryStats;
  lastUpdated?: Date | null;
}

function formatAda(value?: number) {
  if (value == null) return "—";
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B ₳`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M ₳`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K ₳`;
  }
  return `${value.toLocaleString()} ₳`;
}

export function Hero({ stats, lastUpdated }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[44px] bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-800 px-6 pb-16 pt-12 text-white shadow-2xl">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-500/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-10">
        <div className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.35em] text-white/80">
            Cardano Treasury Insight
          </span>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Transparent Treasury, Real-time Governance
          </h1>
          <p className="max-w-2xl text-base text-white/70 sm:text-lg">
            Explore TRSC and PSSC contract flows, track budget utilisation, and
            uncover the projects shaping the Cardano ecosystem. Inspired by
            Polkadot Treasury analytics and playful NYC tree visualisations for
            a vivid funding landscape.
          </p>

          <div className="mt-2 flex flex-col gap-6 rounded-3xl bg-white/10 p-6 backdrop-blur sm:flex-row">
            <div className="flex-1">
              <p className="text-sm uppercase tracking-wide text-white/50">
                Treasury Balance
              </p>
              <p className="text-3xl font-semibold">{formatAda(stats?.treasury_balance_ada)}</p>
            </div>
            <div className="flex flex-1 items-center justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-wide text-white/50">
                  Allocated to TRSC
                </p>
                <p className="text-2xl font-semibold">{formatAda(stats?.allocated_to_trsc_ada)}</p>
              </div>
              <a
                href="#contracts"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Explore Contracts
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {lastUpdated && (
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              Last synced {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

