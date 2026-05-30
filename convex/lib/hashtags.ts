const HASHTAG_REGEX = /#([a-zA-Z0-9_]{1,50})/g;
const MENTION_REGEX = /@([a-zA-Z0-9_]{1,30})/g;
export const ASOCIAL_AI_MENTION = "@AsocialAI";

export function extractHashtags(content: string): string[] {
  const tags = new Set<string>();
  for (const match of content.matchAll(HASHTAG_REGEX)) {
    tags.add(match[1].toLowerCase());
  }
  return [...tags];
}

export function extractMentionUsernames(content: string): string[] {
  const mentions = new Set<string>();
  for (const match of content.matchAll(MENTION_REGEX)) {
    if (match[1].toLowerCase() !== "asocialai") {
      mentions.add(match[1].toLowerCase());
    }
  }
  return [...mentions];
}

export function containsAsocialAiMention(content: string): boolean {
  return content.toLowerCase().includes(ASOCIAL_AI_MENTION.toLowerCase());
}
