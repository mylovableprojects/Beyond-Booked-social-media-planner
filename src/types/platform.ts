export const PLATFORMS = [
  "facebook",
  "instagram",
  "google_business_profile",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const CONTENT_FRAMEWORKS = [
  "beyond-bookings",
  "social-content",
  "story-brand",
  "seasonal-holiday",
] as const;

export type ContentFramework = (typeof CONTENT_FRAMEWORKS)[number];

export type GeneratorStatus = "queued" | "running" | "completed" | "failed";
