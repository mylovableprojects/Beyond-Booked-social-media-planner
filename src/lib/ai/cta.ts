import { PLATFORM_CTA_BANK } from "@/lib/constants/platforms";
import type { Platform } from "@/types/platform";

// Deterministic CTA rotation for repeatable generation runs.
export function rotateCtaForPost(
  platform: Platform,
  postIndex: number,
  runSeed = 0,
): string {
  const ctas = PLATFORM_CTA_BANK[platform];
  return ctas[(runSeed + postIndex) % ctas.length];
}

