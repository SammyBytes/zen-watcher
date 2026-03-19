
import type { MozillaResponse } from "../models/mozilla-response.model";
import { MOZ_CENTRAL_BASE } from "./consts";

export const MOZ_CENTRAL_JSON_PUSHES_BASE = `${MOZ_CENTRAL_BASE}/json-pushes?full=1`;

const timeout = 15000; // 15 seconds of margin for large responses

export const getChangesSince = async (
  lastKnownPushId: string | number,
): Promise<MozillaResponse> => {
  const url = `${MOZ_CENTRAL_JSON_PUSHES_BASE}&frompushid=${lastKnownPushId}`;

  console.log(`[getChangesSince] Fetching data from ${url}`);

  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeout),
  });

  if (!response.ok) {
    throw new Error(
      `Error fetching data from ${url}: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as MozillaResponse;
};
