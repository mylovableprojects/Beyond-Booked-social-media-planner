import { z } from "zod";

import { CONTENT_FRAMEWORKS, PLATFORMS } from "@/types/platform";

export const platformEnum = z.enum(PLATFORMS);
export const frameworkEnum = z.enum(CONTENT_FRAMEWORKS);

export const generatorRequestSchema = z.object({
  platforms: z.array(platformEnum).min(1),
  eventTypes: z.array(z.string().trim().min(2).max(80)).min(1),
  serviceCategories: z.array(z.string().trim().min(2).max(80)).min(1),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2025).max(2100),
  postCount: z.union([z.literal(1), z.literal(3), z.literal(9), z.literal(15)]),
  promoText: z.string().trim().max(240).optional(),
  featuredProduct: z.string().trim().max(120).optional(),
});

export type GeneratorRequestInput = z.infer<typeof generatorRequestSchema>;
