import type { ContentFramework, Platform } from "@/types/platform";

export type GenerationInput = {
  profileId: string;
  city: string;
  stateRegion?: string | null;
  month: number;
  year: number;
  postCount: number;
  platforms: Platform[];
  eventTypes: string[];
  serviceCategories: string[];
  promoText?: string;
  featuredProduct?: string;
};

export type GeneratedPost = {
  platform: Platform;
  frameworkUsed: ContentFramework;
  ctaUsed: string;
  postIndex: number;
  content: string;
  imageSuggestion: string;
  validationReport: {
    isValid: boolean;
    errors: string[];
    stats: Record<string, number | boolean>;
  };
};
