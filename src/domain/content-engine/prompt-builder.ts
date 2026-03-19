import type { ContentFramework, Platform } from "@/types/platform";

type PromptBuilderInput = {
  platform: Platform;
  framework: ContentFramework;
  city: string;
  eventTypes: string[];
  serviceCategories: string[];
  seasonalMoments: string[];
  cta: string;
  promoText?: string;
  featuredProduct?: string;
};

const PLATFORM_RULES: Record<Platform, string> = {
  facebook: [
    "PLATFORM: Facebook",
    "• Total word count: 40–80 words. Count every word. Do not exceed 80.",
    "• NO hashtags. Not even one.",
    "• Maximum 2 emojis total in the entire post.",
    "• Tone: warm, conversational, like talking to a neighbour.",
    "• Structure: 1–2 short paragraphs. End with a CTA sentence.",
  ].join("\n"),

  instagram: [
    "PLATFORM: Instagram",
    "• Total word count: 100–150 words INCLUDING the hashtag line.",
    "• Line 1 (the hook): 6–11 words max. Make it punchy and scroll-stopping — a question, bold statement, or vivid scene.",
    "• Body: 2–4 short paragraphs with line breaks between them.",
    "• Maximum 2 emojis in the body text.",
    "• NO hashtags anywhere in the body.",
    "• Final line: ONLY hashtags — between 5 and 8, space-separated. Example: #PartyRentals #BounceHouse #KidsParty #Windsor #InflatableFun",
    "• End the body with a CTA before the hashtag line.",
  ].join("\n"),

  google_business_profile: [
    "PLATFORM: Google Business Profile",
    "• Total word count: 75–125 words.",
    "• NO hashtags at all.",
    "• NO emojis at all.",
    "• Must mention the city name at least once naturally in the text.",
    "• Must contain a direct CTA using at least one of these words: call, book, message, quote, contact, reserve.",
    "• Tone: professional, trustworthy, local business.",
    "• Structure: 2–3 short paragraphs. No lists or bullet points.",
  ].join("\n"),
};

const FRAMEWORK_INSTRUCTIONS: Record<ContentFramework, string> = {
  "beyond-bookings": [
    "FRAMEWORK: Beyond Bookings",
    "This framework positions the rental business as more than a vendor — it's the reason the event became a cherished memory.",
    "Angle: Focus on the emotional outcome (joy, connection, relief, pride) that the customer feels AFTER the event.",
    "Structure:",
    "  1. Open by painting the feeling of a successful event ('Everyone gathered around...', 'The kids didn't want to leave...')",
    "  2. Briefly connect that feeling to what made it possible (your service).",
    "  3. Close with a CTA that frames booking as investing in a memory, not just renting equipment.",
    "Do NOT list equipment specs or features. Keep it emotional and outcome-driven.",
  ].join("\n"),

  "social-content": [
    "FRAMEWORK: Social Content (Engagement-First)",
    "This framework prioritises likes, comments, shares and saves over direct selling.",
    "Angle: Relatable, fun, or useful content that happens to come from a party rental business.",
    "Structure: Choose ONE of these angles:",
    "  A) Relatable moment — a funny or true observation about planning kids' parties or events.",
    "  B) Quick tip — one practical event-planning tip the audience can use today.",
    "  C) 'This or that' / poll style — ask a light question to spark comments.",
    "Rules: Do NOT make it a hard sell. The CTA should be soft ('Save this for your next event' or 'Tag a parent who needs this').",
    "The business is mentioned naturally, not as the main subject.",
  ].join("\n"),

  "story-brand": [
    "FRAMEWORK: StoryBrand",
    "The customer is the HERO. Your business is the GUIDE.",
    "Structure (follow this order):",
    "  1. CHARACTER — Name the customer's situation or desire in one sentence ('You're planning a birthday party and you want it to be amazing.').",
    "  2. PROBLEM — Name the real frustration or fear ('Coordinating entertainment, setup, and cleanup is exhausting.').",
    "  3. GUIDE — Position the business as the experienced helper with a simple plan ('That's why [city] families trust us — we handle everything.').",
    "  4. CTA — One clear next step ('Message us and we'll send you a custom quote today.').",
    "Keep it tight. Each step = 1–2 sentences. No fluff.",
  ].join("\n"),

  "seasonal-holiday": [
    "FRAMEWORK: Seasonal / Holiday",
    "This framework ties the post directly to the current season or upcoming moments in the calendar.",
    "Angle: Make the seasonal moment the reason to act NOW — create urgency through timing, not pressure.",
    "Structure:",
    "  1. Open by naming the season or upcoming event type ('Spring break is three weeks away...', 'Summer party season is officially here.').",
    "  2. Connect it to the customer's upcoming plans ('...which means your backyard party planning starts now.').",
    "  3. Show how the business fits that moment (one sentence, specific).",
    "  4. Urgency CTA — dates are filling, book before it's gone.",
    "Use the seasonal moments provided. Be specific, not generic.",
  ].join("\n"),
};

export function buildPrompt(input: PromptBuilderInput) {
  const platformRules = PLATFORM_RULES[input.platform];
  const frameworkInstructions = FRAMEWORK_INSTRUCTIONS[input.framework];

  return [
    "You are a professional social media copywriter for a party rental / inflatable rental business.",
    "Write exactly ONE post. Follow ALL rules below precisely.",
    "",
    "=== PLATFORM RULES (mandatory) ===",
    platformRules,
    "",
    "=== COPYWRITING FRAMEWORK (mandatory) ===",
    frameworkInstructions,
    "",
    "=== BUSINESS CONTEXT ===",
    `City: ${input.city}.`,
    `Event types: ${input.eventTypes.join(", ")}.`,
    `Services: ${input.serviceCategories.join(", ")}.`,
    input.framework === "seasonal-holiday" && input.seasonalMoments.length
      ? `Seasonal context (use this): ${input.seasonalMoments.join(", ")}.`
      : "Do NOT reference seasons, holidays, or time of year unless it comes up naturally.",
    input.promoText ? `Active promotion: ${input.promoText}.` : "",
    input.featuredProduct ? `Featured product: ${input.featuredProduct}.` : "",
    `CTA to use: ${input.cta}.`,
    "",
    "=== HUMAN WRITING RULES (mandatory — violations will be rejected) ===",
    "These rules make the post sound like a real person wrote it, not AI.",
    "BANNED — never use these words or phrases:",
    "  • elevate, elevating, elevates",
    "  • unleash, unlock",
    "  • seamless, seamlessly",
    "  • game-changer, game changer",
    "  • dive in, dive into",
    "  • leverage, leveraging",
    "  • robust, cutting-edge, state-of-the-art",
    "  • unforgettable experience, unforgettable memories",
    "  • look no further",
    "  • we are thrilled, we are excited to announce",
    "  • transformative, transform your",
    "  • in today's world, in today's fast-paced",
    "  • it's important to note, it's worth noting",
    "  • at the end of the day",
    "  • take your [anything] to the next level",
    "  • don't miss out",
    "BANNED punctuation patterns:",
    "  • Em dashes (— or –) — use a comma or period instead.",
    "  • Exclamation marks: maximum ONE per post total. Zero is fine.",
    "  • Ellipses (...) in the middle of sentences.",
    "SENTENCE RULES:",
    "  • Write short, direct sentences. Average sentence: 10–15 words.",
    "  • Vary sentence length — mix short punchy sentences with slightly longer ones.",
    "  • No filler openings like 'Are you ready to...', 'Have you ever wondered...', 'Imagine a world where...'",
    "  • No corporate-speak. Write the way a local business owner would actually talk.",
    "  • Contractions are encouraged (it's, we've, you'll, don't).",
    "",
    "=== OUTPUT ===",
    "Respond with a single JSON object — no markdown fences, no extra text.",
    'Keys: "hookType" (string), "content" (the complete ready-to-post text), "cta" (the CTA sentence used), "imageSuggestion" (one sentence describing an ideal photo).',
    "CRITICAL — content formatting:",
    "  • Separate every paragraph with \\n\\n (a blank line). Never write the post as one block of text.",
    "  • For Instagram: the hook line must be its own paragraph (\\n\\n before the body). Hashtags must be their own final paragraph (\\n\\n before them).",
    "  • For Facebook and Google Business Profile: each paragraph separated by \\n\\n.",
    "  • Short sentences within the same paragraph do NOT need extra line breaks — only use \\n\\n between paragraphs.",
  ]
    .filter(Boolean)
    .join("\n");
}
