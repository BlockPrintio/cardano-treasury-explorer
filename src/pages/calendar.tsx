import { Geist, Geist_Mono } from "next/font/google";
import Head from "next/head";
import { CalendarDays, Clock, MapPin, RefreshCw } from "lucide-react";
import { useMemo } from "react";

import { StatCard } from "@/components/cards/StatCard";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useCalendarEvents, useTreasuryStats } from "@/hooks/useTreasury";
import type { CalendarEvent } from "@/types/treasury";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function CalendarPage() {
  const calendar = useCalendarEvents();
  const stats = useTreasuryStats();

  const events = useMemo(() => transformEvents(calendar.data ?? []), [calendar.data]);
  const upcoming = events.filter((event) => event.date >= startOfDay(new Date())).slice(0, 12);

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 font-sans text-zinc-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-white`}
    >
      <Head>
        <title>Cardano Treasury · Calendar</title>
        <meta
          name="description"
          content="Track upcoming Cardano Treasury milestones, planned disbursements, and key project payments."
        />
      </Head>

      <SiteHeader />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 pb-16 pt-6 lg:px-6">
        <section className="relative overflow-hidden rounded-[44px] bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-800 px-6 py-12 text-white shadow-2xl">
          <div className="pointer-events-none absolute -left-28 top-16 h-72 w-72 rounded-full bg-indigo-500/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl" />
          <div className="relative z-10 space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
              Treasury Calendar
            </span>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight">
              Foresight for Treasury Milestones & Disbursements
            </h1>
            <p className="max-w-2xl text-base text-white/70">
              Inspired by Polkadot treasury dashboards and the spatial storytelling of NYC street trees,
              this calendar charts the rhythm of ADA flowing to Cardano projects.
            </p>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-3">
          <StatCard
            title="Upcoming Milestones"
            value={upcoming.length.toString()}
            change={formatDateRange(upcoming)}
            changeTone="neutral"
            changeLabel="Next windows"
            icon={CalendarDays}
          />
          <StatCard
            title="Vendors Claiming"
            value={stats.data?.pssc_count.toLocaleString() ?? "—"}
            change={`${events.length.toLocaleString()} events mapped`}
            changeTone="neutral"
            changeLabel="calendar scope"
            icon={MapPin}
          />
          <StatCard
            title="Last Sync"
            value={calendar.data ? "Live" : "—"}
            change={calendar.error ? "Fetch error" : "Auto refresh 10 min"}
            changeTone={calendar.error ? "negative" : "neutral"}
            changeLabel={calendar.isValidating ? "Refreshing…" : ""}
            icon={RefreshCw}
          />
        </section>

        {calendar.error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center text-rose-600 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-200">
            Unable to load calendar events right now.
          </div>
        ) : (
          <section className="space-y-8">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">
              Upcoming Highlights
            </h2>

            {calendar.isLoading ? (
              <div className="flex flex-col items-center gap-3 rounded-3xl border border-zinc-200/70 bg-white/80 p-12 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
                <Clock className="h-8 w-8 animate-spin text-indigo-500" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading milestones…</p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupByMonth(upcoming).map(([month, entries]) => (
                  <div key={month} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-indigo-500/15 text-indigo-500 dark:bg-indigo-400/10">
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold">
                          {month.split(" ")[0]}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-white">{month}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {entries.length} milestone{entries.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {entries.map((event) => (
                        <article
                          key={event.id}
                          className="group flex flex-col gap-2 rounded-3xl border border-transparent bg-white/80 p-4 transition hover:border-indigo-400/40 hover:bg-white/100 dark:bg-white/10"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                {event.label}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {event.displayDate} · {event.vendor ?? "Cardano Project"}
                              </p>
                            </div>
                            <div className="text-xs text-indigo-500 dark:text-indigo-300">
                              {event.amountAda ? `${event.amountAda.toLocaleString()} ₳` : "Pending"}
                            </div>
                          </div>
                          <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-400">
                            {event.psscAddr ? `${event.psscAddr.slice(0, 8)}…${event.psscAddr.slice(-6)}` : "—"}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function transformEvents(events: CalendarEvent[]) {
  return (events ?? [])
    .map((event) => {
      const date = event.date ? new Date(event.date) : null;
      if (!date || Number.isNaN(date.valueOf())) return null;
      const title = event.title?.includes("undefined") ? "Treasury Milestone" : event.title ?? "Treasury Milestone";
      const amount = event.extendedProps?.amount_ada ?? null;

      return {
        id: event.id,
        label: title,
        date,
        displayDate: date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        amountAda: amount,
        vendor: (event.extendedProps?.vendor as string | undefined) ?? undefined,
        psscAddr: event.extendedProps?.pssc_addr as string | undefined,
      };
    })
    .filter((event): event is NonNullable<typeof event> => Boolean(event))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function groupByMonth(events: ReturnType<typeof transformEvents>) {
  const groups = new Map<string, typeof events>();
  events.forEach((event) => {
    const key = event.date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const bucket = groups.get(key) ?? [];
    bucket.push(event);
    groups.set(key, bucket);
  });
  return Array.from(groups.entries());
}

function formatDateRange(events: ReturnType<typeof transformEvents>) {
  if (!events.length) return "No upcoming";
  const first = events[0].date;
  const last = events[events.length - 1].date;
  return `${first.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${last.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

