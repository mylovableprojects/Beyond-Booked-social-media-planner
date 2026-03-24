import type { Platform } from "@/types/platform";

function wordCount(input: string) {
  const words = input.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

function emojiCount(input: string) {
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  return (input.match(emojiRegex) ?? []).length;
}

function hashtagCount(input: string) {
  return (input.match(/(^|\s)#[a-zA-Z0-9_]+/g) ?? []).length;
}

function hasCityMention(input: string, city: string) {
  return input.toLowerCase().includes(city.toLowerCase());
}

export type RuleValidationResult = {
  isValid: boolean;
  errors: string[];
  stats: Record<string, number | boolean>;
};

export function validatePlatformRules(
  platform: Platform,
  content: string,
  city = "",
): RuleValidationResult {
  const words = wordCount(content);
  const emojis = emojiCount(content);
  const hashtags = hashtagCount(content);
  const lines = content.split("\n").filter(Boolean);
  const errors: string[] = [];

  if (platform === "facebook") {
    if (words < 40 || words > 80) errors.push("Facebook word count must be 40-80.");
    if (hashtags > 0) errors.push("Facebook posts cannot include hashtags.");
    if (emojis > 2) errors.push("Facebook allows up to 2 emojis.");
  }

  if (platform === "instagram") {
    if (words < 100 || words > 150)
      errors.push("Instagram word count must be 100-150 including hashtags.");
    if ((lines[0]?.trim().split(/\s+/).filter(Boolean).length ?? 0) >= 12) {
      errors.push("Instagram first line must be under 12 words.");
    }
    const nonFinalLines = lines.slice(0, -1).join("\n");
    if (hashtagCount(nonFinalLines) > 0) {
      errors.push("Instagram hashtags must appear only on the final line.");
    }
    const finalLineHashtags = hashtagCount(lines.at(-1) ?? "");
    if (finalLineHashtags < 5 || finalLineHashtags > 8) {
      errors.push("Instagram final line must include 5-8 hashtags.");
    }
    if (emojis > 2) errors.push("Instagram allows up to 2 emojis.");
  }

  if (platform === "google_business_profile") {
    if (words < 75 || words > 125) {
      errors.push("Google Business Profile word count must be 75-125.");
    }
    if (hashtags > 0) errors.push("Google Business Profile cannot include hashtags.");
    if (emojis > 0) errors.push("Google Business Profile cannot include emojis.");
    if (city && !hasCityMention(content, city)) {
      errors.push("Google Business Profile must mention the city.");
    }
    if (!/(call|book|message|quote|contact|reserve)/i.test(content)) {
      errors.push("Google Business Profile requires a clear CTA.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    stats: {
      words,
      emojis,
      hashtags,
    },
  };
}
