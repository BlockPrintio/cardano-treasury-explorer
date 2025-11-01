"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  Treemap,
  Tooltip,
  type TreemapProps,
} from "recharts";

import type { PsscContract, TrscContract } from "@/types/treasury";

interface TreasuryTreemapProps {
  trsc: TrscContract[];
  pssc: PsscContract[];
}

type TreemapNode = NonNullable<TreemapProps["data"]>[number];

type TreemapCellProps = TreemapNode & {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
};

export function TreasuryTreemap({ trsc, pssc }: TreasuryTreemapProps) {
  const data = useMemo<TreemapNode[]>(() => {
    if (!trsc?.length) return [];

    const psscByFund = pssc.reduce<Record<string, PsscContract>>((acc, contract) => {
      acc[contract.fund_tx] = contract;
      return acc;
    }, {});

    return trsc.map((contract) => ({
      name: contract.name,
      value: contract.balance ?? 0,
      children: contract.children?.map((child) => {
        const linked = psscByFund[child.id];
        const amount = child.balance ?? child.budgetAda ?? linked?.budget ?? 0;
        return {
          name: child.vendor ?? linked?.project ?? "Unknown",
          value: amount,
          vendor: child.vendor ?? linked?.project ?? "Unknown",
          claimed: linked?.claimed ?? child.claimedAda ?? 0,
          status: linked?.status ?? child.status,
        } satisfies TreemapNode;
      }),
    }));
  }, [pssc, trsc]);

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-zinc-200/60 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100/30 via-transparent to-indigo-100/30 dark:from-sky-500/5 dark:to-indigo-500/5" />
      <div className="relative z-10 flex flex-col gap-3 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500/80">
            Distribution Map
          </p>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
            TRSC → PSSC Budget Treemap
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Tile area tracks allocated ADA. Hover to inspect project budgets and claimed share.
          </p>
        </div>
      </div>

      <div className="relative z-10 h-full min-h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={data}
            dataKey="value"
            stroke="#ffffff"
            fill="#4f46e5"
            aspectRatio={4 / 3}
            content={<CustomCell />}
          >
            <Tooltip content={<TreemapTooltip />} cursor={{ fill: "rgba(79, 70, 229, 0.12)" }} />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CustomCell(props: TreemapCellProps) {
  const { x, y, width, height, name, value, fill = "#4f46e5" } = props;

  const rounded = Math.min(width, height) > 40;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill,
          stroke: "rgba(255,255,255,0.65)",
          strokeWidth: 1,
        }}
        rx={rounded ? 18 : 8}
        ry={rounded ? 18 : 8}
      />
      {width > 80 && height > 40 ? (
        <text x={x + 12} y={y + 24} fill="#ffffff" fontSize={12} fontWeight={600}>
          {name}
        </text>
      ) : null}
      {width > 80 && height > 60 ? (
        <text x={x + 12} y={y + 44} fill="rgba(255,255,255,0.75)" fontSize={11}>
          {value.toLocaleString()} ₳
        </text>
      ) : null}
    </g>
  );
}

function TreemapTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: TreemapNode }>;
}) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload as TreemapNode & {
    vendor?: string;
    claimed?: number;
    status?: number | string;
  };

  return (
    <div className="min-w-[220px] rounded-2xl border border-white/20 bg-slate-900/95 p-4 text-sm text-white shadow-xl">
      <p className="text-base font-semibold">{item.vendor ?? item.name}</p>
      <p className="mt-1 text-sm text-white/70">
        Allocated: <strong className="text-white">{item.value?.toLocaleString()} ₳</strong>
      </p>
      {item.claimed !== undefined && (
        <p className="text-xs text-white/60">
          Claimed: {item.claimed.toLocaleString()} ₳
        </p>
      )}
      {item.status !== undefined && (
        <p className="text-xs text-white/50">Status: {item.status}%</p>
      )}
    </div>
  );
}

