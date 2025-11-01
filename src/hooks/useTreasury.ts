import useSWR from "swr";

import type {
  CalendarEvent,
  TreasuryData,
  TreasuryStats,
} from "@/types/treasury";

const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return (await response.json()) as T;
};

export function useTreasuryData() {
  const swr = useSWR<TreasuryData>("/api/treasury-data", fetcher, {
    refreshInterval: 5 * 60 * 1000,
  });

  return swr;
}

export function useTreasuryStats() {
  const swr = useSWR<TreasuryStats>("/api/treasury-stats", fetcher, {
    refreshInterval: 5 * 60 * 1000,
  });

  return swr;
}

export function useCalendarEvents() {
  const swr = useSWR<CalendarEvent[]>("/api/calendar-events", fetcher, {
    refreshInterval: 10 * 60 * 1000,
  });

  return swr;
}

export function useDataVersion() {
  return useSWR<{ lastModified: number }>("/api/data-version", fetcher, {
    refreshInterval: 60 * 1000,
  });
}

