/** Field-upload posts use custom length / emoji / hashtag rules (not main generator Instagram rules). */

function wordCount(input: string) {
  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function emojiCount(input: string) {
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  return (input.match(emojiRegex) ?? []).length;
}

function extractHashtags(block: string): string[] {
  const matches = block.match(/#[A-Za-z0-9_]+/g);
  return matches ?? [];
}

export type FieldUploadValidationResult = {
  isValid: boolean;
  errors: string[];
};

/**
 * Caption: 40–80 words, 4–8 emojis.
 * Hashtag block: 10–15 tags; must include #PartyRentalBusiness and #PartyRentalToolkit.
 */
export function validateFieldUploadOutput(caption: string, hashtagBlock: string): FieldUploadValidationResult {
  const errors: string[] = [];
  const words = wordCount(caption);
  if (words < 40 || words > 80) {
    errors.push(`Caption must be 40–80 words (got ${words}).`);
  }
  const emojis = emojiCount(caption);
  if (emojis < 4 || emojis > 8) {
    errors.push(`Caption must include 4–8 emojis (got ${emojis}).`);
  }
  const tags = extractHashtags(hashtagBlock);
  if (tags.length < 10 || tags.length > 15) {
    errors.push(`Hashtags must be 10–15 total (got ${tags.length}).`);
  }
  if (!/#PartyRentalBusiness\b/i.test(hashtagBlock)) {
    errors.push("Hashtags must include #PartyRentalBusiness.");
  }
  if (!/#PartyRentalToolkit\b/i.test(hashtagBlock)) {
    errors.push("Hashtags must include #PartyRentalToolkit.");
  }

  return { isValid: errors.length === 0, errors };
}

export function parseFieldUploadSections(raw: string): { caption: string; hashtags: string } | null {
  const text = raw.replace(/^```[\w]*\s*/i, "").replace(/\s*```\s*$/, "").trim();

  const reCap = /\[CAPTION\]/i;
  const reHash = /\[HASHTAGS\]/i;
  const mCap = reCap.exec(text);
  const mHash = reHash.exec(text);
  if (!mCap || !mHash || mHash.index === undefined || mCap.index === undefined) {
    return null;
  }
  if (mHash.index <= mCap.index) {
    return null;
  }
  const afterCap = mCap.index + mCap[0].length;
  const caption = text.slice(afterCap, mHash.index).trim();
  const afterHash = mHash.index + mHash[0].length;
  const hashtagSection = text.slice(afterHash).trim();
  if (!caption || !hashtagSection) {
    return null;
  }
  return { caption, hashtags: hashtagSection.replace(/\s+/g, " ").trim() };
}
