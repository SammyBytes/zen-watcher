export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
}

export interface DiscordEmbedMedia {
  url: string;
}

export interface DiscordEmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  timestamp?: string;
  footer?: DiscordEmbedFooter;
  thumbnail?: DiscordEmbedMedia;
  image?: DiscordEmbedMedia;
  author?: DiscordEmbedAuthor;
  fields?: DiscordEmbedField[];
}
