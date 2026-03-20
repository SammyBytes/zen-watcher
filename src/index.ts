import { mozEventToDiscordPayload } from "./modules/discord-moz-shared/event.mapper";
import { filterChanges } from "./modules/discord-moz-shared/filter.service";
import { sendGeckoAlert } from "./modules/discord/services/discord.service";
import type { Changeset } from "./modules/moz/models/changeset.model";
import type { MozillaResponse } from "./modules/moz/models/mozilla-response.model";
import { getChangesSince } from "./modules/moz/services/json-pushes.service";
import { getState, saveState } from "./modules/state/services/state.services";
import type { Zone } from "./modules/zones/models/zone.model";
import { filterZones, getZones } from "./modules/zones/services/zones.services";

try {
  const lastState = await getState();
  const currentPushId = lastState.lastPushId;
  console.log(`[index] Last known push ID: ${currentPushId}`);

  if (typeof currentPushId !== "number") {
    throw new Error(
      `Invalid lastPushId in state: ${currentPushId}. Expected a number.`,
    );
  }

  const data = await getChangesSince(currentPushId);

  //Update state with the latest push ID, even if no relevant changes were found, to avoid reprocessing old pushes
  const pushIds = Object.keys(data).sort((a, b) => Number(a) - Number(b));
  const lastPushId = pushIds[pushIds.length - 1] || currentPushId;

  console.log(`[index] Latest push ID from Mozilla Central: ${lastPushId}`);

  if (!lastPushId || Number(lastPushId) <= currentPushId) {
    console.log("[index] No new pushes since last check.");
    process.exit(0);
  }

  const zones = await getZones();

  const filteredData = filterChanges(data, zones);

  const totalGroups = Object.keys(filteredData).length;
  console.log(`[index] ${totalGroups} push groups match your zones.`);

  if (totalGroups === 0) {
    console.log("[index] No relevant changes found. Skipping Discord.");
  } else {
    const payload = mozEventToDiscordPayload(filteredData);
    await sendGeckoAlert(payload);
  }

  await saveState({ lastPushId: Number(lastPushId) });
  console.log(`[index] New Push ID: ${lastPushId}`);
} catch (error) {
  console.error(error);
}
