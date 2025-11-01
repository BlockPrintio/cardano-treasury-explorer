import type {
  CalendarEvent,
  TreasuryData,
  TreasuryStats,
} from "@/types/treasury";

const BASE_URL = "https://cardanotreasury.fi/api";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function getTreasuryData(): Promise<TreasuryData> {
  return fetchJson<TreasuryData>("/treasury-data");
}

export async function getTreasuryStats(): Promise<TreasuryStats> {
  return fetchJson<TreasuryStats>("/treasury-stats");
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  return fetchJson<CalendarEvent[]>("/calendar-events");
}

export async function getDataVersion(): Promise<{ lastModified: number }> {
  return fetchJson<{ lastModified: number }>("/data-version");
}

