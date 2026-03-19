import { z } from "zod";

import { CONTENT_FRAMEWORKS, PLATFORMS } from "@/types/platform";

export const validationReportSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  stats: z.record(z.string(), z.union([z.number(), z.boolean()])),
});

export const generatedPostSchema = z.object({
  platform: z.enum(PLATFORMS),
  frameworkUsed: z.enum(CONTENT_FRAMEWORKS),
  ctaUsed: z.string().min(1),
  postIndex: z.number().int().min(0),
  content: z.string().min(1),
  imageSuggestion: z.string().min(1),
  validationReport: validationReportSchema,
});

export const exportRequestSchema = z.object({
  generationRunId: z.string().uuid(),
});
