import { z } from "zod";

const nonEmptyLabel = z.string().trim().min(2).max(80);

export const profileSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  stateRegion: z.string().trim().max(80).optional().or(z.literal("")),
  timezone: z.string().trim().min(2).max(80).default("America/Chicago"),
  brandNotes: z.string().trim().max(2000).optional().or(z.literal("")),
  selectedEventTypes: z.array(nonEmptyLabel).min(1),
  selectedServiceCategories: z.array(nonEmptyLabel).min(1),
});

export const customLibraryItemSchema = z.object({
  name: nonEmptyLabel,
});

export type ProfileInput = z.infer<typeof profileSchema>;
