import { getMozCentralJsonPushes } from "./modules/moz/services/json-pushes.service";

console.log("[1] Initializing...");

try {
  console.log("[2] Fetching data from Mozilla Central...");
  const data = await getMozCentralJsonPushes();
  console.log(
    "[3] Data fetched:",
    Object.keys(data).length,
    "pushes",
    Object.values(data).length,
    "changesets",
    Object.values(data).reduce((acc, curr) => acc + curr.changesets.length, 0),
    "commits",
  );

  console.log("[4] Loading zones...");
  const hotzonesFile = Bun.file("./zones.json");
  const hotzonesData = (await hotzonesFile.json()) as string[];
  console.log("[5] Zones loaded:", hotzonesData.length);

  const isZone = (file: string) =>
    hotzonesData.some((zone) => file.includes(zone));

  console.log("[6] Checking commits...");

  for (const [pushId, pushInfo] of Object.entries(data)) {
    // @ts-ignore
    pushInfo.changesets.forEach((commit: any) => {
      commit.files.forEach((file: string) => {
        if (isZone(file)) {
          console.log(`[6] Commit ${commit.node} in ${file}`);
        }
      });
    });
  }

  console.log("[7] Done!");
} catch (error) {
  console.error("Error fatal:", error);
}
