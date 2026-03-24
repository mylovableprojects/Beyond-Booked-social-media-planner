import { validatePlatformRules } from "@/domain/content-engine/platform-rules";
import type { Platform } from "@/types/platform";

export function countWords(input: string): number {
  const words = input.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

export function getWordCountRangeForPlatform(platform: Platform): { min: number; max: number } {
  if (platform === "facebook") return { min: 40, max: 80 };
  if (platform === "instagram") return { min: 100, max: 150 };
  return { min: 75, max: 125 }; // google_business_profile
}

export function validateWordCountForPlatform(platform: Platform, content: string): {
  isValid: boolean;
  wordCount: number;
  min: number;
  max: number;
} {
  const wordCount = countWords(content);
  const { min, max } = getWordCountRangeForPlatform(platform);
  return {
    isValid: wordCount >= min && wordCount <= max,
    wordCount,
    min,
    max,
  };
}

export function validatePlatformRulesForText(
  platform: Platform,
  content: string,
  city = "",
) {
  // Reuse existing platform rules validator to keep behavior consistent.
  return validatePlatformRules(platform, content, city);
}

