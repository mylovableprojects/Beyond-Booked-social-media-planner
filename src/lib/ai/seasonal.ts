import { getSeasonalMoments } from "@/domain/content-engine/seasonal-moments";

export type SeasonalContext = {
  season: string;
  holidays: string[];
  // Moments to help the model tie the content to what is happening locally/seasonally.
  eventBusinessMoments: string[];
};

const MONTH_TO_SEASON: Record<number, string> = {
  1: "Winter",
  2: "Winter",
  3: "Spring",
  4: "Spring",
  5: "Spring",
  6: "Summer",
  7: "Summer",
  8: "Summer",
  9: "Fall",
  10: "Fall",
  11: "Fall",
  12: "Winter",
};

const MONTH_TO_HOLIDAYS: Record<number, string[]> = {
  1: ["New Year's Day", "MLK Jr. Day"],
  2: ["Valentine's Day", "Presidents' Day"],
  3: ["Spring break season", "St. Patrick's Day (regional)"],
  4: ["Easter weekend", "Spring fairs and carnivals"],
  5: ["Memorial Day weekend"],
  6: ["Start of summer vacation season"],
  7: ["4th of July weekend"],
  8: ["Back-to-school season"],
  9: ["Labor Day weekend", "Fall kickoff events"],
  10: ["Halloween (trunk-or-treat season)"],
  11: ["Veterans Day", "Thanksgiving / Friendsgiving"],
  12: ["Holiday party season", "New Year's countdown planning"],
};

type SeasonalContextInput = {
  month: number;
  year: number;
  city?: string;
};

// Map month/year into:
// - high-level "season"
// - a small set of relevant holidays
// - event-business moments for the local calendar
export function getSeasonalContext(input: SeasonalContextInput): SeasonalContext {
  const month = input.month;
  const year = input.year;
  const citySafe = input.city?.trim() ? input.city.trim() : "your city";

  const season = MONTH_TO_SEASON[month] ?? "Seasonal";
  const holidays = MONTH_TO_HOLIDAYS[month] ?? [];

  const eventBusinessMoments = getSeasonalMoments({
    month,
    year,
    city: citySafe,
  });

  // Add season + holidays as explicit hooks so they’re easy for downstream prompt assembly.
  return {
    season,
    holidays,
    eventBusinessMoments: [
      `${citySafe} ${year} event planning context`,
      ...eventBusinessMoments,
      ...(holidays.length ? [`Holiday/holiday-weekend moments: ${holidays.join(", ")}.`] : []),
    ],
  };
}

