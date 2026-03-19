import { getCtaForPost } from "@/domain/content-engine/cta-rotator";
import { getFrameworkForPost } from "@/domain/content-engine/framework-rotator";
import { humanizeContent } from "@/domain/content-engine/humanization-pass";
import { validatePlatformRules } from "@/domain/content-engine/platform-rules";
import { buildPrompt } from "@/domain/content-engine/prompt-builder";
import { getSeasonalMoments } from "@/domain/content-engine/seasonal-moments";
import { AnthropicProvider } from "@/services/llm/anthropic";
import type { GenerationInput, GeneratedPost } from "@/types/content";

const llm = new AnthropicProvider();

export async function generatePostsDraft(
  input: GenerationInput,
): Promise<GeneratedPost[]> {
  const tasks: Array<() => Promise<GeneratedPost>> = [];

  for (let postIndex = 0; postIndex < input.postCount; postIndex += 1) {
    const framework = getFrameworkForPost(postIndex);
    for (const platform of input.platforms) {
      const cta = getCtaForPost(platform, postIndex, input.year + input.month);
      const prompt = buildPrompt({
        platform,
        framework,
        city: input.city,
        eventTypes: input.eventTypes,
        serviceCategories: input.serviceCategories,
        seasonalMoments: getSeasonalMoments({
          month: input.month,
          year: input.year,
          city: input.city,
        }),
        cta,
        promoText: input.promoText,
        featuredProduct: input.featuredProduct,
      });

      tasks.push(async () => {
        const { content: raw } = await llm.generate({ prompt });

        let content = raw;
        let imageSuggestion = "Photo of kids and families enjoying a colorful inflatable setup during golden-hour lighting.";

        try {
          // Strip markdown code fences if present
          const stripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
          const parsed = JSON.parse(stripped);
          content = parsed.content ?? raw;
          imageSuggestion = parsed.imageSuggestion ?? imageSuggestion;
        } catch {
          // LLM didn't return JSON — use raw text as-is
        }

        content = humanizeContent(content);
        const validationReport = validatePlatformRules(platform, content, input.city);

        return { platform, frameworkUsed: framework, ctaUsed: cta, postIndex, content, imageSuggestion, validationReport };
      });
    }
  }

  return Promise.all(tasks.map((t) => t()));
}
