import type { DiscordEmbed } from "./embed.model";

export interface DiscordWebhookPayload {
  content?: string;
  username?: string;
  avatar_url?: string;
  /**
   * Discord webhooks accept an array of up to 10 embeds per message.
   */
  embeds?: DiscordEmbed[];
}
