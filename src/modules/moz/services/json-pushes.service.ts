import type { MozillaResponse } from "../models/mozilla-response.model";
import { MOZ_CENTRAL_BASE } from "./consts";

export const MOZ_CENTRAL_JSON_PUSHES_BASE = `${MOZ_CENTRAL_BASE}/json-pushes?full=1`;

export const getMozCentralJsonPushes = async (
  fromPushId: string = "44204",
): Promise<MozillaResponse> => {
  const url = `${MOZ_CENTRAL_JSON_PUSHES_BASE}&frompushid=${fromPushId}`;
  const response = await fetch(url);
  return response.json() as unknown as MozillaResponse;
};
