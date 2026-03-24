import type { ContentFramework, Platform } from "@/types/platform";
import type { GenerationInput } from "@/types/content";

import { FRAMEWORK_ROTATION_ORDER } from "@/lib/constants/frameworks";
import { FRAMEWORK_PROMPTS } from "./prompts";
import { rotateCtaForPost } from "./cta";
import { getSeasonalContext } from "./seasonal";

export type GenerationSkeletonItem = {
  postIndex: number;
  platform: Platform;
  framework: ContentFramework;
  cta: string;
  seasonal: ReturnType<typeof getSeasonalContext>;
  // Fully assembled prompt text to be sent to the model later.
  // (No model calls in this utility yet.)
  prompt: string;
};

function getFrameworkForPostIndex(postIndex: number): ContentFramework {
  return FRAMEWORK_ROTATION_ORDER[postIndex % FRAMEWORK_ROTATION_ORDER.length];
}

function buildFrameworkPrompt(input: {
  platform: Platform;
  framework: ContentFramework;
  city: string;
  eventTypes: string[];
  serviceCategories: string[];
  seasonal: ReturnType<typeof getSeasonalContext>;
  cta: string;
  promoText?: string;
  featuredProduct?: string;
  month: number;
  year: number;
}): string {
  const base = FRAMEWORK_PROMPTS[input.framework];
  const promo = input.promoText?.trim() ? `Promo text: ${input.promoText.trim()}.` : "";
  const featured = input.featuredProduct?.trim()
    ? `Featured product/theme: ${input.featuredProduct.trim()}.`
    : "";

  // Skeleton prompt; tune structure once you start integrating a real model call.
  return [
    base,
    `Platform: ${input.platform}.`,
    `Business city: ${input.city}.`,
    `Target month/year: ${String(input.month).padStart(2, "0")}/${input.year}.`,
    `Event types: ${input.eventTypes.join(", ")}.`,
    `Service categories: ${input.serviceCategories.join(", ")}.`,
    `Season: ${input.seasonal.season}.`,
    `Holidays: ${input.seasonal.holidays.join(", ")}.`,
    `Event-business moments: ${input.seasonal.eventBusinessMoments.join("; ")}.`,
    `CTA intent: ${input.cta}.`,
    promo,
    featured,
    "Output strict JSON only with keys: hookType, content, cta, imageSuggestion.",
  ]
    .filter(Boolean)
    .join(" ");
}

// Skeleton orchestration: builds per-post prompt objects,
// rotating frameworks in the required order and rotating CTAs deterministically.
export function buildGenerationSkeleton(input: GenerationInput): GenerationSkeletonItem[] {
  const seasonal = getSeasonalContext({
    month: input.month,
    year: input.year,
    city: input.city,
  });

  const items: GenerationSkeletonItem[] = [];
  for (let postIndex = 0; postIndex < input.postCount; postIndex += 1) {
    const framework = getFrameworkForPostIndex(postIndex);
    for (const platform of input.platforms) {
      const cta = rotateCtaForPost(platform, postIndex, 0);
      const prompt = buildFrameworkPrompt({
        platform,
        framework,
        city: input.city,
        eventTypes: input.eventTypes,
        serviceCategories: input.serviceCategories,
        seasonal,
        cta,
        promoText: input.promoText,
        featuredProduct: input.featuredProduct,
        month: input.month,
        year: input.year,
      });

      items.push({
        postIndex,
        platform,
        framework,
        cta,
        seasonal,
        prompt,
      });
    }
  }

  return items;
}

