import { FIELD_CAPTURE_CTA_BANK, PLATFORM_CTA_BANK } from "@/lib/constants/platforms";
import type { Platform } from "@/types/platform";

export function getCtaForPost(platform: Platform, postIndex: number, runSeed = 0) {
  const ctas = PLATFORM_CTA_BANK[platform];
  return ctas[(runSeed + postIndex) % ctas.length];
}

export function getFieldCaptureCta(platform: Platform, runSeed: number) {
  const ctas = FIELD_CAPTURE_CTA_BANK[platform];
  if (!ctas.length) {
    return getCtaForPost(platform, 0, runSeed);
  }
  return ctas[runSeed % ctas.length];
}
