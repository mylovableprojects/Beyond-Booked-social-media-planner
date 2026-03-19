import { z } from "zod";

const listItemSchema = z.string().trim().min(2).max(80);

export const onboardingSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  aboutStory: z.string().trim().max(1200).optional().or(z.literal("")),
  selectedEventTypes: z.array(listItemSchema).min(1),
  selectedServiceCategories: z.array(listItemSchema).min(1),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
