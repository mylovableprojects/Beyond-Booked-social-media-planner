import type { Platform } from "@/types/platform";

/** Instagram field-capture posts: clear next step, no "DM us" / link-in-bio pressure. */
export const FIELD_CAPTURE_CTA_BANK: Record<Platform, string[]> = {
  instagram: [
    "Planning something similar? Message us for a quote.",
    "Want a setup like this? Call or message us for pricing.",
    "Ask about your date, call or message anytime.",
    "Need this at your party? Reach out for a quick quote.",
  ],
  facebook: [],
  google_business_profile: [],
};

export const PLATFORM_CTA_BANK: Record<Platform, string[]> = {
  facebook: [
    "Send us a message to lock in your date.",
    "Tap to get a quick custom quote.",
    "Call now to reserve your party setup.",
    "Message our team for package options.",
  ],
  instagram: [
    "DM us to reserve your date.",
    "Send us a message for pricing today.",
    "Tap the link in bio for a fast quote.",
    "DM us and we will match you to the right package.",
  ],
  google_business_profile: [
    "Call us today to reserve your event date.",
    "Request a quote now and secure your booking.",
    "Contact our team to check availability this week.",
    "Book your setup now before dates fill up.",
  ],
};

export const PLATFORM_RULE_SUMMARIES: Record<Platform, string> = {
  facebook: "40-80 words, no hashtags, conversational, 0-2 emojis.",
  instagram:
    "100-150 words including hashtags, first line under 12 words, 5-8 hashtags on final line, 0-2 emojis.",
  google_business_profile:
    "75-125 words, no hashtags, no emojis, must mention city and clear CTA.",
};
