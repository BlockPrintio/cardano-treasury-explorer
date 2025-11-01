import type { NextApiRequest, NextApiResponse } from "next";

import { getTreasuryStats } from "@/lib/api";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const data = await getTreasuryStats();
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Unable to load treasury stats",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

