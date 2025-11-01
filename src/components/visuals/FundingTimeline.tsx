"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TrscContract } from "@/types/treasury";

interface FundingTimelineProps {
  trsc: TrscContract[];
}

interface TimelineDatum {
  month: string;
  displayMonth: string;
  incoming: number;
  outgoing: number;
}

export function FundingTimeline({ trsc }: FundingTimelineProps) {
  const points = useMemo<TimelineDatum[]>(() => {
    const aggregator = new Map<string, TimelineDatum>();

    trsc.forEach((contract) => {
      contract.children?.forEach((child) => {
        if (!child.fund_date) return;
        const date = new Date(child.fund_date);
        if (Number.isNaN(date.valueOf())) return;
        const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
        const entry = aggregator.get(key) ?? {
          month: key,
          displayMonth: date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          incoming: 0,
          outgoing: 0,
        };

        entry.outgoing += child.budgetAda ?? child.balance ?? 0;
        aggregator.set(key, entry);
      });

      if (contract.incomingToTRSC && contract.children?.[0]?.fund_date) {
        const date = new Date(contract.children[0].fund_date);
        if (!Number.isNaN(date.valueOf())) {
          const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
          const entry = aggregator.get(key) ?? {
            month: key,
            displayMonth: date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            }),
            incoming: 0,
            outgoing: 0,
          };
          entry.incoming += contract.incomingToTRSC ?? contract.balance ?? 0;
          aggregator.set(key, entry);
        }
      }
    });

    return Array.from(aggregator.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [trsc]);

  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-3xl border border-zinc-200/60 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-transparent to-sky-100 dark:from-indigo-500/10 dark:to-sky-500/10" />
      <div className="relative z-10 mb-4 flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500/80">
          Flow Over Time
        </p>
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
          Monthly Treasury Movements
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Compare incoming treasury allocations against outgoing project funding.
        </p>
      </div>

      <div className="relative z-10 h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incoming" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="outgoing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="rgba(99,102,241,0.12)" />
            <XAxis dataKey="displayMonth" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis tickFormatter={(value) => `${Math.round(value / 1_000) / 1_000}M`} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} width={60} />
            <Tooltip content={<TimelineTooltip />} />
            <Area type="monotone" dataKey="incoming" stroke="#0ea5e9" fillOpacity={1} fill="url(#incoming)" strokeWidth={2.5} />
            <Area type="monotone" dataKey="outgoing" stroke="#4338ca" fillOpacity={1} fill="url(#outgoing)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TimelineTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: keyof TimelineDatum }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;

  return (
    <div className="min-w-[200px] rounded-2xl border border-white/10 bg-slate-900/95 p-4 text-sm text-white shadow-xl">
      <p className="text-sm font-medium text-white/80">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="mt-1 text-sm">
          <span className="text-white/60">{entry.dataKey === "incoming" ? "Incoming" : "Outgoing"}:</span>{" "}
          <strong>{entry.value.toLocaleString()} ₳</strong>
        </p>
      ))}
    </div>
  );
}

