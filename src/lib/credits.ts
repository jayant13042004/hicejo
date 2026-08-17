export type FeatureKey = "ats_check" | "roast" | "tailor" | "cover_letter";

export interface DailyCreditState {
  date: string; // YYYY-MM-DD
  ats_check: number;
  roast: number;
  tailor: number;
  cover_letter: number;
}

export const DAILY_LIMITS: Record<FeatureKey, number> = {
  ats_check: 3,
  roast: 2,
  tailor: 2,
  cover_letter: 2
};

export const FEATURE_NAMES: Record<FeatureKey, string> = {
  ats_check: "Resume ATS Score Checker",
  roast: "Resume Roast",
  tailor: "Resume Tailor",
  cover_letter: "Cover Letter Generator"
};

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getCreditUsage(): DailyCreditState {
  if (typeof window === "undefined") {
    return {
      date: getTodayString(),
      ats_check: 0,
      roast: 0,
      tailor: 0,
      cover_letter: 0
    };
  }

  const stored = localStorage.getItem("hicejo_daily_credits");
  const today = getTodayString();

  if (stored) {
    try {
      const parsed: DailyCreditState = JSON.parse(stored);
      if (parsed.date === today) {
        return parsed;
      }
    } catch {}
  }

  const initial: DailyCreditState = {
    date: today,
    ats_check: 0,
    roast: 0,
    tailor: 0,
    cover_letter: 0
  };
  localStorage.setItem("hicejo_daily_credits", JSON.stringify(initial));
  return initial;
}

export function getRemainingCredits(feature: FeatureKey): number {
  const usage = getCreditUsage();
  const limit = DAILY_LIMITS[feature];
  const used = usage[feature] || 0;
  return Math.max(0, limit - used);
}

export function canUseFeature(feature: FeatureKey): boolean {
  return getRemainingCredits(feature) > 0;
}

export function consumeCredit(feature: FeatureKey): boolean {
  if (typeof window === "undefined") return true;

  const usage = getCreditUsage();
  if ((usage[feature] || 0) >= DAILY_LIMITS[feature]) {
    return false;
  }

  usage[feature] = (usage[feature] || 0) + 1;
  localStorage.setItem("hicejo_daily_credits", JSON.stringify(usage));
  window.dispatchEvent(new Event("hicejo_credits_updated"));
  return true;
}
