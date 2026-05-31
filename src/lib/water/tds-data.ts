import type { RoutineStep, WaterProfile } from "@/lib/types";

/**
 * Hyperlocal water hardness dataset.
 *
 * This is the proprietary, defensible differentiator for Prana Sync: a curated
 * map of locality -> measured TDS range and the biophysical consequences of
 * that water chemistry. Values are seeded from field research across Bangalore
 * and can be crowd-sourced / expanded over time.
 *
 * BIS reference: water > 150 ppm is "hard", > 300 ppm is "very hard".
 */
export const WATER_PROFILES: WaterProfile[] = [
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
    pathologies: [
      "Mild cuticle swelling",
      "Moderate product buildup",
      "Dullness",
    ],
    annualCostOfInactionInr: 8000,
  },
  {
    area: "HSR Layout",
    city: "Bangalore",
    primarySource: "Mixed municipal & tanker",
    tdsMin: 250,
    tdsMax: 450,
    risk: "moderate",
    pathologies: [
      "Mild cuticle swelling",
      "Moderate product buildup",
      "Dullness",
    ],
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

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Find the best matching water profile for a free-text locality string. */
export function lookupWaterProfile(query: string): WaterProfile | null {
  const q = normalize(query);
  if (!q) return null;

  // Exact area match first.
  const exact = WATER_PROFILES.find((p) => normalize(p.area) === q);
  if (exact) return exact;

  // Partial / contains match (handles "Sarjapur Road", "EC Phase 1", etc.).
  const partial = WATER_PROFILES.find(
    (p) => q.includes(normalize(p.area)) || normalize(p.area).includes(q),
  );
  return partial ?? null;
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
