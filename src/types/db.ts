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
  /** owner = paying business account; worker = field capture only (employer_profile_id set). */
  account_role: "owner" | "worker";
  /** Read-only admin UI: user list without destructive actions (super admin sets this). */
  is_support_admin: boolean;
  /** Business owner's profile id (auth user id); only for account_role = worker. */
  employer_profile_id: string | null;
  is_admin: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: "trial" | "active" | "canceled" | "past_due";
  subscription_expires_at: string | null;
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

export type FieldUploadRow = {
  id: string;
  created_at: string;
  worker_name: string;
  worker_id: string;
  raw_notes: string | null;
  generated_caption: string | null;
  hashtags: string | null;
  photo_url: string;
  photo_path: string;
  event_type: string | null;
  source: string;
  status: "draft" | "published";
};
