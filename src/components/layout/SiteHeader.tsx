import Link from "next/link";

import { cn } from "@/lib/cn";

interface SiteHeaderProps {
  sticky?: boolean;
  className?: string;
}

const navItems = [
  { href: "#metrics", label: "Metrics" },
  { href: "#contracts", label: "Contracts" },
  { href: "#visualizations", label: "Visualizations" },
  { href: "/calendar", label: "Calendar" },
];

export function SiteHeader({ sticky = true, className }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "z-40 w-full border-b border-transparent bg-gradient-to-b from-white/95 to-white/40 backdrop-blur transition-all dark:from-black/95 dark:to-black/40",
        sticky && "supports-[backdrop-filter]:sticky supports-[backdrop-filter]:top-0",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-500 text-white shadow-lg">
            ₳
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
              Cardano
            </span>
            <span className="text-base font-semibold text-zinc-900 dark:text-white">
              Treasury Explorer
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 md:flex dark:text-zinc-300">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative transition-colors hover:text-indigo-500"
            >
              {item.label}
              <span className="absolute inset-x-0 -bottom-1 h-0.5 origin-center scale-x-0 rounded-full bg-indigo-500 transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-xs">
          <a
            href="https://cardanotreasury.fi/"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 font-semibold text-indigo-600 transition hover:bg-indigo-500/20 dark:text-indigo-300"
          >
            Live Portal ↗
          </a>
        </div>
      </div>
    </header>
  );
}

