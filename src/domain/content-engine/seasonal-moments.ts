type SeasonalMomentInput = {
  month: number;
  year: number;
  city: string;
};

const MONTHLY_MOMENTS: Record<number, string[]> = {
  1: ["new year celebrations", "indoor winter birthdays", "kickoff community events"],
  2: ["Valentine's parties", "school winter socials", "heart-themed fundraisers"],
  3: ["spring break gatherings", "early spring festivals", "outdoor season kickoff"],
  4: ["Easter weekend events", "spring carnivals", "school family nights"],
  5: ["graduation parties", "Memorial Day weekend", "end-of-school celebrations"],
  6: ["summer break launch", "backyard birthday weekends", "community block parties"],
  7: ["4th of July gatherings", "peak summer weekends", "park and church festivals"],
  8: ["late summer family reunions", "back-to-school bashes", "church picnics"],
  9: ["fall kickoff events", "tailgate season parties", "community harvest gatherings"],
  10: ["Halloween events", "fall festivals", "school trunk-or-treat nights"],
  11: ["Friendsgiving parties", "indoor church events", "holiday season booking push"],
  12: ["holiday parties", "winter break events", "new year pre-party planning"],
};

export function getSeasonalMoments(input: SeasonalMomentInput): string[] {
  const monthly = MONTHLY_MOMENTS[input.month] ?? [];
  return [`${input.city} ${input.year} event calendar`, ...monthly];
}
