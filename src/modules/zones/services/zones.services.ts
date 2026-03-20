import type { Zone } from "../models/zone.model";
import { join } from "path";

export const getZones = async (): Promise<Zone[]> => {
  const zonesFilePath = join(process.cwd(), "zones.json");
  const response = await Bun.file(zonesFilePath).json();

  return Object.entries(response).map(([name, path]) => ({
    name,
    path: path as string,
  }));
};

export const filterZones = (zones: Zone[], paths: string[]): Zone[] => {
  if (paths.length === 0) return Array.isArray(zones) ? zones : [];
  return Array.isArray(zones)
    ? zones.filter(
        (zone) => typeof zone.path === "string" && paths.includes(zone.path),
      )
    : [];
};
