import { describe, expect, it } from "vitest";

import { getCtaForPost } from "./cta-rotator";
import { getFrameworkForPost } from "./framework-rotator";
import { getSeasonalMoments } from "./seasonal-moments";
import { validatePlatformRules } from "./platform-rules";

describe("framework rotation", () => {
  it("rotates in the required order", () => {
    expect(getFrameworkForPost(0)).toBe("beyond-bookings");
    expect(getFrameworkForPost(1)).toBe("social-content");
    expect(getFrameworkForPost(2)).toBe("story-brand");
    expect(getFrameworkForPost(3)).toBe("seasonal-holiday");
    expect(getFrameworkForPost(4)).toBe("beyond-bookings");
  });
});

describe("cta rotation", () => {
  it("is deterministic for a given seed", () => {
    const first = getCtaForPost("facebook", 2, 15);
    const second = getCtaForPost("facebook", 2, 15);
    expect(first).toBe(second);
  });
});

describe("seasonal moments", () => {
  it("returns city-aware seasonal moments", () => {
    const moments = getSeasonalMoments({ month: 10, year: 2026, city: "Chicago" });
    expect(moments[0]).toContain("Chicago");
    expect(moments.length).toBeGreaterThan(1);
  });
});

describe("platform validators", () => {
  it("flags hashtags on Facebook", () => {
    const result = validatePlatformRules("facebook", "This is a #hashtag post with enough words to trigger validation in a simple test case that should fail quickly.");
    expect(result.isValid).toBe(false);
    expect(result.errors.some((error) => error.includes("hashtags"))).toBe(true);
  });
});
