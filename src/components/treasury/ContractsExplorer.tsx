"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Info, Search } from "lucide-react";

import { cn } from "@/lib/cn";
import type { PsscContract, TrscContract, TreasuryData } from "@/types/treasury";

interface ContractsExplorerProps {
  data?: TreasuryData;
}

const palette = [
  "bg-gradient-to-br from-sky-500 to-indigo-500",
  "bg-gradient-to-br from-violet-500 to-fuchsia-500",
  "bg-gradient-to-br from-emerald-500 to-teal-500",
  "bg-gradient-to-br from-amber-500 to-orange-500",
];

export function ContractsExplorer({ data }: ContractsExplorerProps) {
  const [focusedTrscId, setFocusedTrscId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { trscList, selected, psscList } = useMemo(() => {
    const trsc: TrscContract[] = data?.trsc ?? [];
    const pssc = data?.pssc ?? [];

    const selectedTrsc = resolveSelectedTrsc(trsc, focusedTrscId);
    const filtered = filterPssc(pssc, search);

    return {
      trscList: trsc,
      selected: selectedTrsc,
      psscList: selectedTrsc
        ? filtered.filter((contract) =>
            selectedTrsc.children?.some((child) => child.id === contract.fund_tx),
          )
        : filtered,
    };
  }, [data?.pssc, data?.trsc, focusedTrscId, search]);

  const aggregated = useMemo(() => aggregateStats(psscList), [psscList]);

  return (
    <section id="contracts" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500/80">
            Contracts
          </p>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
            Treasury Routing Smart Contracts (TRSC) & Project Smart Contracts (PSSC)
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            Dive into individual contract flows. Tap a TRSC to focus the downstream PSSC portfolio,
            search vendors, or inspect claimed versus allocated ADA progress with NYCTrees-inspired visuals.
          </p>
        </div>

        <label className="flex w-full items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm shadow-sm transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/40 dark:border-white/10 dark:bg-white/5 sm:max-w-xs">
          <Search className="h-4 w-4 text-zinc-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search vendors or projects"
            className="w-full bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400 dark:text-white"
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
        <div className="space-y-4">
          {trscList.map((contract, index) => (
            <button
              key={contract.id}
              onClick={() => setFocusedTrscId((prev) => (prev === contract.id ? null : contract.id))}
              className={cn(
                "relative w-full overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/90 p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/5 dark:bg-white/10",
                selected?.id === contract.id && "border-indigo-500/60 shadow-xl",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-500/80">
                  TRSC
                </p>
                <span className={cn("h-10 w-10 rounded-2xl p-[2px]", palette[index % palette.length])}>
                  <span className="flex h-full w-full items-center justify-center rounded-[18px] bg-white/80 text-sm font-semibold text-slate-900">
                    {contract.children_count ?? contract.children?.length ?? 0}
                  </span>
                </span>
              </div>
              <h3 className="mt-2 text-base font-semibold text-zinc-900 dark:text-white">
                {contract.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Balance {formatCurrency(contract.balance)} • Incoming {formatCurrency(contract.incomingToTRSC)}
              </p>
              {selected?.id === contract.id && (
                <p className="mt-2 text-xs text-indigo-500">Focused view · showing linked PSSC contracts</p>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <SmallMetric title="Total Contracts" value={psscList.length.toLocaleString()} />
            <SmallMetric title="Allocated" value={formatCurrency(aggregated.totalBudget)} />
            <SmallMetric title="Claimed" value={formatCurrency(aggregated.totalClaimed)} trend={aggregated.claimedRatio} />
          </div>

          <div className="space-y-3 rounded-3xl border border-zinc-200/70 bg-white/90 p-4 shadow-sm dark:border-white/5 dark:bg-white/10">
            {psscList.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                <Info className="h-6 w-6" />
                <p>No PSSC contracts match the current filters.</p>
              </div>
            ) : (
              psscList.map((contract) => (
                <ContractRow key={contract.fund_tx} contract={contract} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function resolveSelectedTrsc(trscList: TrscContract[], id: string | null) {
  if (!id) return null;
  return trscList.find((contract) => contract.id === id) ?? null;
}

function filterPssc(pssc: PsscContract[], search: string) {
  if (!search) return pssc;
  const query = search.toLowerCase();
  return pssc.filter((contract) => {
    const vendor = contract.vendor ?? contract.project ?? "";
    return vendor.toLowerCase().includes(query);
  });
}

function aggregateStats(contracts: PsscContract[]) {
  const { totalBudget, totalClaimed } = contracts.reduce(
    (acc, contract) => {
      acc.totalBudget += contract.budget ?? 0;
      acc.totalClaimed += contract.claimed ?? 0;
      return acc;
    },
    { totalBudget: 0, totalClaimed: 0 },
  );

  return {
    totalBudget,
    totalClaimed,
    claimedRatio: totalBudget > 0 ? totalClaimed / totalBudget : 0,
  };
}

function formatCurrency(value?: number) {
  if (!value || Number.isNaN(value)) return "—";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B ₳`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ₳`;
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}K ₳`;
  return `${Math.round(value).toLocaleString()} ₳`;
}

function SmallMetric({ title, value, trend }: { title: string; value: string; trend?: number }) {
  return (
    <div className="rounded-3xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm dark:border-white/5 dark:bg-white/5">
      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-white">{value}</p>
      {trend !== undefined && (
        <p className="text-[11px] uppercase tracking-widest text-emerald-500/80">
          {Math.round(trend * 100)}% claimed
        </p>
      )}
    </div>
  );
}

function ContractRow({ contract }: { contract: PsscContract }) {
  const vendor = contract.vendor ?? contract.project ?? "Unknown vendor";
  const claimed = contract.claimed ?? 0;
  const budget = contract.budget ?? 0;
  const ratio = budget > 0 ? Math.min(claimed / budget, 1) : 0;

  return (
    <article className="group rounded-3xl border border-transparent bg-white/70 p-4 transition hover:border-indigo-400/40 hover:bg-white/90 dark:bg-white/5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-white">{vendor}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {contract.status ?? 0}% progress · Claimed {formatCurrency(claimed)}
          </p>
        </div>
        <div className="text-right text-xs text-zinc-500 dark:text-zinc-400">
          Budget {formatCurrency(budget)}
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-200/70 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>Funded: {contract.fund_date ? new Date(contract.fund_date).toLocaleDateString() : "—"}</span>
        <a
          href={`https://cardanoscan.io/transaction/${contract.fund_tx}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-medium text-indigo-500 transition hover:text-indigo-400"
        >
          View Tx
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </article>
  );
}

