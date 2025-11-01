import { Geist, Geist_Mono } from "next/font/google";
import Head from "next/head";
import { Loader2, PiggyBank, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useMemo } from "react";

import { StatCard } from "@/components/cards/StatCard";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Hero } from "@/components/sections/Hero";
import { ContractsExplorer } from "@/components/treasury/ContractsExplorer";
import { FundingTimeline } from "@/components/visuals/FundingTimeline";
import { TreasuryNetworkGraph } from "@/components/visuals/TreasuryNetworkGraph";
import { TreasuryTreemap } from "@/components/visuals/TreasuryTreemap";
import { useDataVersion, useTreasuryData, useTreasuryStats } from "@/hooks/useTreasury";
import type { TreasuryStats } from "@/types/treasury";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const treasuryData = useTreasuryData();
  const treasuryStats = useTreasuryStats();
  const dataVersion = useDataVersion();

  const lastUpdated = dataVersion.data?.lastModified
    ? new Date(dataVersion.data.lastModified)
    : null;

  const metrics = useMemo(() => computeMetrics(treasuryStats.data), [treasuryStats.data]);

  const isLoading = treasuryData.isLoading || treasuryStats.isLoading;
  const hasError = treasuryData.error || treasuryStats.error;

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} relative min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 font-sans text-zinc-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-white`}
    >
      <Head>
        <title>Cardano Treasury Explorer</title>
        <meta
          name="description"
          content="Explore Cardano Treasury contracts, funding flows, and milestone timelines with interactive dashboards inspired by Polkadot and NYC tree visualisations."
        />
      </Head>

      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-16 pt-6 lg:px-6">
        <Hero stats={treasuryStats.data} lastUpdated={lastUpdated} />

        <section id="metrics" className="-mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <StatCard key={metric.title} {...metric} />
          ))}
        </section>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-zinc-200/70 bg-white/80 p-12 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Fetching the latest treasury flows…</p>
          </div>
        ) : hasError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center text-rose-600 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200">
            <p className="text-sm font-medium">Unable to load treasury data right now.</p>
            <p className="mt-1 text-xs opacity-80">Please try again shortly.</p>
          </div>
        ) : (
          <>
            <section id="visualizations" className="grid gap-6 xl:grid-cols-3">
              {treasuryData.data && (
                <TreasuryNetworkGraph
                  data={treasuryData.data}
                  className="xl:col-span-2"
                />
              )}
              {treasuryData.data && <FundingTimeline trsc={treasuryData.data.trsc} />}
              {treasuryData.data && (
                <div className="xl:col-span-3">
                  <TreasuryTreemap trsc={treasuryData.data.trsc} pssc={treasuryData.data.pssc} />
                </div>
              )}
            </section>

            <ContractsExplorer data={treasuryData.data} />
          </>
        )}
      </main>
    </div>
  );
}

function computeMetrics(stats?: TreasuryStats) {
  if (!stats) {
    return [
      { title: "Treasury Balance", value: "—", icon: PiggyBank },
      { title: "Allocated", value: "—", icon: ShieldCheck },
      { title: "Vendors Active", value: "—", icon: Users },
      { title: "Claimed %", value: "—", icon: Sparkles },
    ];
  }

  return [
    {
      title: "Treasury Balance",
      value: formatAda(stats.treasury_balance_ada),
      change: formatAda(stats.remaining_treasury_ada),
      changeTone: "positive" as const,
      changeLabel: "Remaining",
      icon: PiggyBank,
    },
    {
      title: "Allocated to TRSC",
      value: formatAda(stats.allocated_to_trsc_ada),
      change: `${((stats.allocated_to_trsc_ada / stats.annual_budget) * 100).toFixed(1)}%`,
      changeTone: "neutral" as const,
      changeLabel: "of annual budget",
      icon: ShieldCheck,
    },
    {
      title: "Active PSSC",
      value: stats.pssc_count.toLocaleString(),
      change: `${stats.trsc_count} TRSC nodes`,
      changeTone: "neutral" as const,
      changeLabel: "routing contracts",
      icon: Users,
    },
    {
      title: "Claimed by Vendors",
      value: formatAda(stats.claimed_by_vendors_ada),
      change: `${stats.budget_claimed_percentage.toFixed(1)}%`,
      changeTone: "positive" as const,
      changeLabel: "of allocated",
      icon: Sparkles,
    },
  ];
}

function formatAda(value: number) {
  if (!Number.isFinite(value)) return "—";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B ₳`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M ₳`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}K ₳`;
  return `${Math.round(value).toLocaleString()} ₳`;
}
