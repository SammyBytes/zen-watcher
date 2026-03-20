import type { Changeset } from "../moz/models/changeset.model";
import type { MozillaResponse } from "../moz/models/mozilla-response.model";
import type { Zone } from "../zones/models/zone.model";

export const filterChanges = (
  data: MozillaResponse,
  zones: Zone[],
): MozillaResponse => {
  const filtered: MozillaResponse = {};
  const zonePaths = zones.map((z) => z.path);

  for (const [pushId, push] of Object.entries(data)) {
    const validChangesets = push.changesets.filter((changeset: Changeset) => {
      // Noise filter: Exclude commits that are likely automated or irrelevant
      if (!changeset.desc || changeset.desc.startsWith("merge")) return false;

      // Zone filter: Check if any file in the commit starts with any of your paths
      const touchesZone = changeset.files.some((file) =>
        zonePaths.some((zonePath) => file.startsWith(zonePath)),
      );

      return touchesZone;
    });

    if (validChangesets.length > 0) {
      filtered[pushId] = {
        ...push,
        changesets: validChangesets,
      };
    }
  }
  return filtered;
};
