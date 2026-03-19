import type { GeneratorStatus, Platform } from "@/types/platform";

export type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string;
  city: string;
  state_region: string | null;
  timezone: string;
  brand_notes: string | null;
  trial_runs_used: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type GenerationRunRow = {
  id: string;
  profile_id: string;
  month: number;
  year: number;
  post_count: number;
  promo_text: string | null;
  featured_product: string | null;
  status: GeneratorStatus;
  created_at: string;
};

export type GenerationSelectionRow = {
  id: string;
  generation_run_id: string;
  platforms: Platform[];
  event_types: string[];
  service_categories: string[];
};
