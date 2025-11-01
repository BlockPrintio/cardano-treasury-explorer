import { type ComponentType } from "react";

import { cn } from "@/lib/cn";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeTone?: "positive" | "negative" | "neutral";
  changeLabel?: string;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
}

const toneStyles: Record<NonNullable<StatCardProps["changeTone"]>, string> = {
  positive:
    "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-300",
  negative:
    "bg-rose-500/10 text-rose-500 dark:bg-rose-500/10 dark:text-rose-300",
  neutral:
    "bg-slate-500/10 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300",
};

export function StatCard({
  title,
  value,
  change,
  changeTone = "neutral",
  changeLabel,
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-zinc-200/60 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5",
        "transition-all hover:-translate-y-0.5 hover:shadow-lg",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          <p className="text-3xl font-semibold text-zinc-900 dark:text-white">
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-2 pt-1">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  toneStyles[changeTone],
                )}
              >
                {change}
              </span>
              {changeLabel && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 via-sky-500/10 to-emerald-500/10 p-3 text-indigo-500 dark:text-indigo-300">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}

