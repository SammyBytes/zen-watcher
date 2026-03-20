import type { Changeset } from "./modules/moz/models/changeset.model";
import { getChangesSince } from "./modules/moz/services/json-pushes.service";

let lastPushId = 44204;
const data = await getChangesSince(lastPushId);
