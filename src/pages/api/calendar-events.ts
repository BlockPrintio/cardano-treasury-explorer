import type { NextApiRequest, NextApiResponse } from "next";

import { getCalendarEvents } from "@/lib/api";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const data = await getCalendarEvents();
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=900");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Unable to load calendar events",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

