import type {
  DiscordEmbed,
  DiscordEmbedField,
} from "../discord/models/embed.model";
import type { DiscordWebhookPayload } from "../discord/models/webhook-payload.model";
import type { MozillaResponse } from "../moz/models/mozilla-response.model";
import type { Changeset } from "../moz/models/changeset.model";

/**
 * Mappers for Mozilla HG pushes to Zen Browser developer alerts.
 * Focuses on brevity, bug tracking, and direct links.
 */
export const mozEventToDiscordPayload = (
  event: MozillaResponse,
): DiscordWebhookPayload => {
  const pushIds = Object.keys(event).sort((a, b) => Number(a) - Number(b));
  const payload: DiscordWebhookPayload = { embeds: [] };

  for (const pushId of pushIds) {
    const group = event[pushId];
    if (!group?.changesets?.length) continue;

    const totalChanges = group.changesets.length;

    // Identification of meaningful work (filtering automated commits)
    const commits = group.changesets.filter((c) => {
      const desc = c.desc?.toLowerCase() || "";
      return !desc.includes("bumping l10n") && !desc.includes("no bug");
    });

    const isMaintenanceOnly = commits.length === 0;
    const displayList = isMaintenanceOnly
      ? group.changesets.slice(0, 3)
      : commits;

    const embed: DiscordEmbed = {
      title: `Push ${pushId} • ${group.user}`,
      url: `https://hg.mozilla.org/mozilla-central/pushloghtml?frompushid=${Number(pushId) - 1}&topushid=${pushId}`,
      color: isMaintenanceOnly ? 0x34495e : 0x7d52ff, // Zen-like purple or slate grey
      description: isMaintenanceOnly
        ? `*Automated maintenance push (${totalChanges} changesets)*`
        : `Summary: **${totalChanges}** changesets detected in tracked zones.`,
      fields: displayList.slice(0, 12).map(transformChangesetToField), // Cap at 12 to avoid Discord bloating
      footer: {
        text: `Mozilla Central • ${new Date(group.date * 1000).toLocaleString()}`,
      },
    };

    // Add a truncation indicator if necessary
    if (totalChanges > displayList.slice(0, 12).length) {
      embed.fields?.push({
        name: "───",
        value: `+ ${totalChanges - 12} more changesets in this push.`,
        inline: false,
      });
    }

    payload.embeds?.push(embed);
  }

  return payload;
};

/**
 * Extracts Bug IDs and formats the changeset for a clean developer view.
 */
function transformChangesetToField(c: Changeset): DiscordEmbedField {
  // Extract "Bug XXXXXX" for easy reference
  const bugMatch = c.desc.match(/bug\s+(\d+)/i);
  const bugSuffix = bugMatch
    ? ` • [**${bugMatch[0].toUpperCase()}**](https://bugzilla.mozilla.org/show_bug.cgi?id=${bugMatch[1]})`
    : "";

  // Get first line of commit message
  const summary =
    c.desc.split("\n")[0] ?? "".replace(/bug\s+\d+[:\-]?\s+/i, "").trim();
  const cleanSummary =
    summary.length > 100 ? `${summary.substring(0, 97)}...` : summary;

  return {
    name: cleanSummary || "No description provided",
    value: `[\`${c.node.substring(0, 7)}\`](https://hg.mozilla.org/mozilla-central/rev/${c.node}) • \`${c.branch}\`${bugSuffix}`,
    inline: false,
  };
}
