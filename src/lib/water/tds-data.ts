import type { RiskLevel, RoutineStep, WaterProfile } from "@/lib/types";

/**
 * Hyperlocal water hardness dataset.
 *
 * This is the proprietary, defensible differentiator for Prana Sync: a curated
 * map of locality -> measured TDS range and the biophysical consequences of
 * that water chemistry.
 *
 * Bangalore profiles are seeded from field research. Delhi NCR / Mumbai /
 * Hyderabad / Pune profiles are seeded from public groundwater & municipal
 * water-quality studies and news reporting (see PLAN.md for sources). Treat
 * non-Bangalore values as informed ESTIMATES — they should be calibrated with
 * a TDS meter and crowd-sourced per society/pincode over time.
 *
 * BIS reference: water > 150 ppm is "hard", > 300 ppm is "very hard".
 */

/** Risk-based defaults so new-city entries stay concise and consistent. */
function defaultsFor(risk: RiskLevel): {
  pathologies: string[];
  annualCostOfInactionInr: number;
} {
  switch (risk) {
    case "very_high":
      return {
        pathologies: [
          "Heavy calcium calcification on hair",
          "Hair snapping mid-shaft",
          "Dry, tight skin & barrier disruption",
          "Scalp flaking that mimics dandruff",
        ],
        annualCostOfInactionInr: 18000,
      };
    case "high":
      return {
        pathologies: [
          "Loss of hair tensile strength",
          "Dry skin patches",
          "Moisture barrier disruption",
          "Mineral + product buildup",
        ],
        annualCostOfInactionInr: 14000,
      };
    case "moderate":
      return {
        pathologies: [
          "Mild cuticle swelling",
          "Moderate product buildup",
          "Dullness",
        ],
        annualCostOfInactionInr: 8000,
      };
    case "low":
      return {
        pathologies: ["Minimal mineral deposit", "Trace chlorine irritation"],
        annualCostOfInactionInr: 4000,
      };
  }
}

/** Compact factory for a water profile using risk-based defaults. */
function wp(
  area: string,
  city: string,
  primarySource: string,
  tdsMin: number,
  tdsMax: number,
  risk: RiskLevel,
): WaterProfile {
  return { area, city, primarySource, tdsMin, tdsMax, risk, ...defaultsFor(risk) };
}

// --- Bangalore (original field research; explicit pathologies preserved) -----
const BANGALORE: WaterProfile[] = [
  {
    area: "Electronic City",
    city: "Bangalore",
    primarySource: "Borewell & tanker mix",
    tdsMin: 400,
    tdsMax: 1236,
    risk: "very_high",
    pathologies: [
      "Heavy calcium calcification on hair",
      "Severe dryness from chlorine",
      "Follicle clogging",
      "Eczema flare-ups",
    ],
    annualCostOfInactionInr: 20000,
  },
  {
    area: "Sarjapur",
    city: "Bangalore",
    primarySource: "Borewell dominant",
    tdsMin: 550,
    tdsMax: 1100,
    risk: "very_high",
    pathologies: [
      "Hair snapping mid-shaft",
      "Scalp flaking that mimics dandruff",
      "Hair colour oxidation / fade",
    ],
    annualCostOfInactionInr: 18000,
  },
  {
    area: "Bellandur",
    city: "Bangalore",
    primarySource: "Borewell dominant",
    tdsMin: 550,
    tdsMax: 1100,
    risk: "very_high",
    pathologies: [
      "Hair snapping mid-shaft",
      "Scalp flaking that mimics dandruff",
      "Hair colour oxidation / fade",
    ],
    annualCostOfInactionInr: 18000,
  },
  {
    area: "Whitefield",
    city: "Bangalore",
    primarySource: "Borewell & tanker",
    tdsMin: 500,
    tdsMax: 900,
    risk: "high",
    pathologies: [
      "Loss of hair tensile strength",
      "Dry skin patches",
      "Moisture barrier disruption",
    ],
    annualCostOfInactionInr: 15000,
  },
  {
    area: "Outer Ring Road",
    city: "Bangalore",
    primarySource: "Borewell & tanker",
    tdsMin: 500,
    tdsMax: 900,
    risk: "high",
    pathologies: [
      "Loss of hair tensile strength",
      "Dry skin patches",
      "Moisture barrier disruption",
    ],
    annualCostOfInactionInr: 15000,
  },
  {
    area: "Koramangala",
    city: "Bangalore",
    primarySource: "Mixed municipal & tanker",
    tdsMin: 250,
    tdsMax: 450,
    risk: "moderate",
    pathologies: ["Mild cuticle swelling", "Moderate product buildup", "Dullness"],
    annualCostOfInactionInr: 8000,
  },
  {
    area: "HSR Layout",
    city: "Bangalore",
    primarySource: "Mixed municipal & tanker",
    tdsMin: 250,
    tdsMax: 450,
    risk: "moderate",
    pathologies: ["Mild cuticle swelling", "Moderate product buildup", "Dullness"],
    annualCostOfInactionInr: 8000,
  },
  {
    area: "Indiranagar",
    city: "Bangalore",
    primarySource: "Municipal (Cauvery)",
    tdsMin: 180,
    tdsMax: 350,
    risk: "low",
    pathologies: ["Minimal mineral deposit", "Trace chlorine irritation"],
    annualCostOfInactionInr: 4000,
  },
  {
    area: "Jayanagar",
    city: "Bangalore",
    primarySource: "Municipal (Cauvery)",
    tdsMin: 180,
    tdsMax: 350,
    risk: "low",
    pathologies: ["Minimal mineral deposit", "Trace chlorine irritation"],
    annualCostOfInactionInr: 4000,
  },
];

// --- Delhi NCR (groundwater is among the hardest in India) -------------------
const DELHI_NCR: WaterProfile[] = [
  wp("Dwarka", "Delhi", "Borewell (deep groundwater)", 800, 1900, "very_high"),
  wp("Rohini", "Delhi", "Borewell & DJB mix", 600, 1500, "very_high"),
  wp("Pitampura", "Delhi", "Borewell & DJB mix", 600, 1400, "very_high"),
  wp("Janakpuri", "Delhi", "Borewell & DJB mix", 500, 1200, "high"),
  wp("Vasant Kunj", "Delhi", "Borewell dominant", 500, 1100, "high"),
  wp("Saket", "Delhi", "Mixed DJB & borewell", 400, 900, "high"),
  wp("Mayur Vihar", "Delhi", "Mixed DJB & borewell", 400, 900, "high"),
  wp("Lajpat Nagar", "Delhi", "DJB municipal", 300, 650, "moderate"),
  wp("Central Delhi", "Delhi", "DJB treated (Yamuna/Ganga)", 250, 550, "moderate"),
  wp("Gurgaon", "Gurgaon", "Borewell & tanker", 700, 1800, "very_high"),
  wp("Sohna Road", "Gurgaon", "Borewell & tanker", 700, 1700, "very_high"),
  wp("Noida", "Noida", "Borewell & groundwater", 1000, 3500, "very_high"),
  wp("Greater Noida", "Greater Noida", "Borewell dominant", 800, 2000, "very_high"),
  wp("Indirapuram", "Ghaziabad", "Borewell & groundwater", 600, 1500, "very_high"),
  wp("Faridabad", "Faridabad", "Borewell & groundwater", 700, 2500, "very_high"),
];

// --- Mumbai (lake-fed municipal supply is notably SOFT) ----------------------
const MUMBAI: WaterProfile[] = [
  wp("South Mumbai", "Mumbai", "Municipal (lakes: Tansa/Bhatsa)", 40, 150, "low"),
  wp("Colaba", "Mumbai", "Municipal (lakes)", 40, 150, "low"),
  wp("Bandra", "Mumbai", "Municipal (lakes)", 50, 180, "low"),
  wp("Andheri", "Mumbai", "Municipal (lakes)", 80, 230, "low"),
  wp("Powai", "Mumbai", "Municipal (lakes)", 80, 220, "low"),
  wp("Vashi", "Navi Mumbai", "Municipal & borewell", 150, 400, "moderate"),
  wp("Thane", "Thane", "Municipal & borewell", 200, 500, "moderate"),
];

// --- Hyderabad (municipal moderate; IT-corridor borewells hard) --------------
const HYDERABAD: WaterProfile[] = [
  wp("Gachibowli", "Hyderabad", "Borewell dominant", 500, 1200, "high"),
  wp("HITEC City", "Hyderabad", "Borewell dominant", 500, 1100, "high"),
  wp("Madhapur", "Hyderabad", "Borewell dominant", 500, 1100, "high"),
  wp("Kondapur", "Hyderabad", "Borewell dominant", 450, 1000, "high"),
  wp("Kukatpally", "Hyderabad", "Mixed municipal & borewell", 350, 700, "moderate"),
  wp("Banjara Hills", "Hyderabad", "Municipal (Krishna/Godavari)", 250, 500, "moderate"),
  wp("Secunderabad", "Hyderabad", "Municipal", 250, 550, "moderate"),
];

// --- Pune (dam-fed municipal moderate; fringe borewells harder) --------------
const PUNE: WaterProfile[] = [
  wp("Hinjewadi", "Pune", "Borewell dominant", 450, 950, "high"),
  wp("Wakad", "Pune", "Borewell & municipal", 380, 780, "high"),
  wp("Baner", "Pune", "Mixed municipal & borewell", 350, 700, "moderate"),
  wp("Hadapsar", "Pune", "Mixed municipal & borewell", 300, 650, "moderate"),
  wp("Viman Nagar", "Pune", "Mixed municipal & borewell", 280, 600, "moderate"),
  wp("Kothrud", "Pune", "Municipal (Khadakwasla)", 200, 450, "moderate"),
];

export const WATER_PROFILES: WaterProfile[] = [
  ...BANGALORE,
  ...DELHI_NCR,
  ...MUMBAI,
  ...HYDERABAD,
  ...PUNE,
];

/** Cities with at least one curated profile (for UI hints). */
export const SUPPORTED_CITIES: string[] = [
  ...new Set(WATER_PROFILES.map((p) => p.city)),
];

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function sameCity(profile: WaterProfile, city?: string): boolean {
  if (!city) return true;
  const c = normalize(city);
  return normalize(profile.city) === c || c.includes(normalize(profile.city));
}

/**
 * Build a representative "typical" profile for a city when we have no exact
 * locality match. Uses the median-ish TDS of known localities in that city so
 * a user typing an unknown area still gets city-appropriate guidance.
 */
function cityTypicalProfile(city: string): WaterProfile | null {
  const inCity = WATER_PROFILES.filter((p) => sameCity(p, city));
  if (inCity.length === 0) return null;
  const tdsMin = Math.round(
    inCity.reduce((s, p) => s + p.tdsMin, 0) / inCity.length,
  );
  const tdsMax = Math.round(
    inCity.reduce((s, p) => s + p.tdsMax, 0) / inCity.length,
  );
  const mid = (tdsMin + tdsMax) / 2;
  const risk: RiskLevel =
    mid >= 700 ? "very_high" : mid >= 450 ? "high" : mid >= 250 ? "moderate" : "low";
  return {
    area: `${inCity[0].city} (typical)`,
    city: inCity[0].city,
    primarySource: "City average (calibrate locally)",
    tdsMin,
    tdsMax,
    risk,
    ...defaultsFor(risk),
  };
}

/**
 * Find the best matching water profile for a free-text locality string.
 * Optionally pass `city` to disambiguate and to enable a city-level fallback.
 */
export function lookupWaterProfile(
  query: string,
  city?: string,
): WaterProfile | null {
  const q = normalize(query);

  if (q) {
    // 1. Exact area match (prefer same city when provided).
    const exact = WATER_PROFILES.filter((p) => normalize(p.area) === q);
    const exactCity = exact.find((p) => sameCity(p, city));
    if (exactCity) return exactCity;
    if (exact[0]) return exact[0];

    // 2. Partial match (handles "Sarjapur Road", "Dwarka Sector 12", etc.).
    const partial = WATER_PROFILES.filter(
      (p) => q.includes(normalize(p.area)) || normalize(p.area).includes(q),
    );
    const partialCity = partial.find((p) => sameCity(p, city));
    if (partialCity) return partialCity;
    if (partial[0]) return partial[0];
  }

  // 3. City-level fallback (e.g. unknown locality but known city).
  if (city) return cityTypicalProfile(city);
  return null;
}

/** Midpoint TDS estimate for a profile, used for scoring. */
export function estimatedTds(profile: WaterProfile): number {
  return Math.round((profile.tdsMin + profile.tdsMax) / 2);
}

/**
 * A 0-100 "Water Score" where higher = gentler water for skin & hair.
 * Soft water (~50 ppm) scores ~100; 1000+ ppm scores near 0.
 */
export function waterScore(profile: WaterProfile): number {
  const tds = estimatedTds(profile);
  const score = 100 - ((tds - 50) / (1200 - 50)) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Net annual saving (INR) achievable by adopting the recommended water
 * interventions. Field data: a KDF-carbon shower filter (~Rs 1,700) plus
 * routine changes drop spend from the cost-of-inaction baseline to ~Rs 12,100.
 */
export function annualSavingInr(profile: WaterProfile): number {
  const baseline = profile.annualCostOfInactionInr;
  const optimizedSpend = profile.risk === "low" ? baseline : 12100;
  return Math.max(0, baseline - optimizedSpend);
}

/** Water-chemistry-specific routine additions, ordered by priority. */
export function waterRoutineSteps(profile: WaterProfile): RoutineStep[] {
  const steps: RoutineStep[] = [];
  const tds = estimatedTds(profile);

  if (tds >= 450) {
    steps.push({
      id: "water-shower-filter",
      time: "WASH",
      title: "Install a KDF + activated-carbon shower filter",
      reason: `Your area (${profile.area}) measures ~${tds} ppm TDS. A shower filter removes up to 90% of chlorine and conditions hard-water minerals, clinically linked to ~78% less hair fall and +11% scalp hydration.`,
      category: "shower filter",
      priority: "critical",
    });
    steps.push({
      id: "water-chelating-shampoo",
      time: "WASH",
      title: "Use a chelating / clarifying shampoo weekly",
      reason:
        "Chelating agents (EDTA, gluconolactone) lift calcium and magnesium deposits off the hair shaft, reversing calcification and brittleness.",
      category: "chelating shampoo",
      priority: "critical",
    });
    steps.push({
      id: "water-barrier-cream",
      time: "PM",
      title: "Apply a rich barrier-repair cream after cleansing",
      reason:
        "Hard-water soap scum strips stratum-corneum lipids. Ceramide + fatty-acid creams restore the moisture barrier and reduce TEWL.",
      category: "barrier repair cream",
      priority: "recommended",
    });
    steps.push({
      id: "water-final-rinse",
      time: "WASH",
      title: "Do a final RO / filtered-water rinse",
      reason:
        "A mineral-free final rinse prevents fresh calcification on freshly washed hair and skin.",
      category: "filtered water",
      priority: "recommended",
    });
  } else if (tds >= 250) {
    steps.push({
      id: "water-clarify-light",
      time: "WASH",
      title: "Add a gentle clarifying wash every 1-2 weeks",
      reason: `${profile.area} is moderate (~${tds} ppm). Occasional clarifying prevents product + mineral buildup and restores shine.`,
      category: "clarifying shampoo",
      priority: "recommended",
    });
  } else {
    steps.push({
      id: "water-maintenance",
      time: "WASH",
      title: "Standard care — your water is gentle",
      reason: `${profile.area} runs low TDS (~${tds} ppm). Focus on barrier maintenance; aggressive clarifying is unnecessary.`,
      category: "maintenance",
      priority: "optional",
    });
  }

  return steps;
}
