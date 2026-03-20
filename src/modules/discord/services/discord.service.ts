import { chunkArray } from "../../../utils/array.utils";
import type { DiscordEmbed, DiscordEmbedField } from "../models/embed.model";
import type { DiscordWebhookPayload } from "../models/webhook-payload.model";

/**
 * Sends Gecko push alerts to Discord.
 * Handles Discord API constraints:
 * - Max 6000 characters per total Embed.
 * - Max 25 fields per Embed.
 * - Max 10 Embeds per Webhook message.
 * - Global 64KB JSON payload limit.
 */
export const sendGeckoAlert = async (payload: DiscordWebhookPayload) => {
  const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
  if (!WEBHOOK_URL) throw new Error("DISCORD_WEBHOOK_URL is not set");

  const originalEmbeds = payload.embeds || [];
  const processedEmbeds: DiscordEmbed[] = [];

  // Fragmentation: Ensure every individual embed respects character and field limits
  for (const group of originalEmbeds) {
    processedEmbeds.push(...splitEmbedByLimits(group));
  }

  // Batching & Delivery: Send in chunks of 3 embeds to stay safely under the 64KB total JSON limit
  const messageChunks = chunkArray(processedEmbeds, 3);

  for (const chunk of messageChunks) {
    await postToWebhook(WEBHOOK_URL, chunk);

    // Brief delay to prevent hitting Discord's Rate Limit (Spam protection)
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
};

/**
 * Splits a single large Embed into multiple smaller parts if it exceeds
 * Discord's display or data limits.
 */
function splitEmbedByLimits(group: DiscordEmbed): DiscordEmbed[] {
  const parts: DiscordEmbed[] = [];
  let currentFields: DiscordEmbedField[] = [];
  let currentChars =
    (group.title?.length || 0) + (group.description?.length || 0);
  let partNumber = 1;

  // Helper to push a constructed embed part to the results
  const flushPart = () => {
    parts.push({
      ...group,
      title: (partNumber === 1
        ? group.title
        : `${group.title} (Part ${partNumber})`
      )?.substring(0, 250),
      description:
        partNumber === 1
          ? group.description?.substring(0, 2048)
          : "Continued...",
      fields: [...currentFields],
    });
    currentChars = 100; // Reset char count with safety margin for JSON overhead
    currentFields = [];
    partNumber++;
  };

  for (const field of group.fields || []) {
    const fName = field.name.substring(0, 250);
    const fValue = field.value.substring(0, 1024);
    const fieldLen = fName.length + fValue.length;

    // Split if: Total chars > 4500 (safe margin) OR Field count >= 15
    if (currentChars + fieldLen > 4500 || currentFields.length >= 15) {
      flushPart();
    }

    currentFields.push({ name: fName, value: fValue, inline: false });
    currentChars += fieldLen;
  }

  if (currentFields.length > 0) flushPart();
  return parts;
}

/**
 * Maximum Discord Webhook payload size in bytes.
 * This is the limit for Discord's 64KB hard limit.
 */
const maxKbPerChunk = 62000;

/**
 * Executes the HTTP POST request to the Discord Webhook.
 */
async function postToWebhook(url: string, embeds: DiscordEmbed[]) {
  const body = JSON.stringify({ embeds });

  // Final safety check for Discord's 64KB hard limit
  if (body.length > maxKbPerChunk) {
    console.warn("[Discord] Payload too large (>62KB), skipping this chunk.");
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Discord Error] ${response.status}: ${errorText}`);
    } else {
      console.log(
        `[Discord] Block delivered successfully (${body.length} bytes)`,
      );
    }
  } catch (error) {
    console.error("[Discord] Network error while sending webhook:", error);
  }
}
