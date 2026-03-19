import { getChangesSince } from "./modules/moz/services/json-pushes.service";

console.log("[1] Initializing...");

let lastPushId = 44204;

try {
  const data = await getChangesSince(lastPushId);
  const pushIds = Object.keys(data).sort((a, b) => Number(a) - Number(b));

  if (pushIds.length === 0) {
    console.log("All done!. No new commits found.");
    process.exit(0);
  }

  console.log("[2] Fetched data:", pushIds.length);

  console.log("[4] Loading zones...");
  const hotzonesFile = Bun.file("./zones.json");
  const hotzonesData = (await hotzonesFile.json()) as string[];
  console.log("[5] Zones loaded:", hotzonesData.length);

  const isZone = (file: string) =>
    hotzonesData.some((zone) => file.includes(zone));

  console.log("[6] Checking commits...");

  for (const id of pushIds) {
    const pushInfo = data[id];

    if (!pushInfo) {
      console.error(`[6] Error: No data for push ${id}`);
      continue;
    }

    pushInfo.changesets.forEach((commit: any) => {
      // Search for critical files
      const criticalFiles = commit.files.filter((file: string) => isZone(file));

      if (criticalFiles.length > 0) {
        console.log(`\n   Commit: ${commit.node.substring(0, 12)}`);
        console.log(`   Hash: ${commit.node.substring(0, 12)}`);
        console.log(`   Desc: ${commit.desc.split("\n")[0]}`);
        console.log(`   Files: ${criticalFiles.join(", ")}`);
      }
    });

    // We need to update the last push ID for the state.json file
    lastPushId = Number(id);
  }

  console.log("[7] Done!");
} catch (error) {
  console.error("Error fatal:", error);
}
