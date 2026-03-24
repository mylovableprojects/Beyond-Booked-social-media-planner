import { PLATFORM_CTA_BANK } from "@/lib/constants/platforms";
import type { Platform } from "@/types/platform";

export function getCtaForPost(platform: Platform, postIndex: number, runSeed = 0) {
  const ctas = PLATFORM_CTA_BANK[platform];
  return ctas[(runSeed + postIndex) % ctas.length];
}
