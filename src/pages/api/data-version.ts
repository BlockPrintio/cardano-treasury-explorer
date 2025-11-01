import type { NextApiRequest, NextApiResponse } from "next";

import { getDataVersion } from "@/lib/api";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const data = await getDataVersion();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Unable to load data version",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

