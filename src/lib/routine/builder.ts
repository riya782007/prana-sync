import type {
  AqiReading,
  Concern,
  RoutineStep,
  WaterProfile,
} from "@/lib/types";
import { waterRoutineSteps } from "@/lib/water/tds-data";
import { aqiRoutineSteps } from "@/lib/aqi/waqi";

const BASE_STEPS: RoutineStep[] = [
  {
    id: "base-cleanse-am",
    time: "AM",
    title: "Gentle cleanse",
    reason: "Start the day with a low-pH, non-stripping cleanser.",
    category: "cleanser",
    priority: "recommended",
  },
  {
    id: "base-moisturise-am",
    time: "AM",
    title: "Lightweight moisturiser",
    reason: "Lock in hydration before sun protection.",
    category: "moisturiser",
    priority: "recommended",
  },
  {
    id: "base-cleanse-pm",
    time: "PM",
    title: "Evening cleanse",
    reason: "Remove the day's sunscreen, sebum and pollutants.",
    category: "cleanser",
    priority: "recommended",
  },
  {
    id: "base-moisturise-pm",
    time: "PM",
    title: "Night moisturiser",
    reason: "Support overnight barrier recovery.",
    category: "moisturiser",
    priority: "recommended",
  },
];

const CONCERN_STEPS: Record<Concern, RoutineStep> = {
  acne: {
    id: "concern-acne",
    time: "PM",
    title: "Add a BHA (salicylic acid) 2-3x/week",
    reason: "Salicylic acid clears clogged follicles that drive breakouts.",
    category: "bha treatment",
    priority: "recommended",
  },
  pigmentation: {
    id: "concern-pigmentation",
    time: "AM",
    title: "Vitamin C in the morning",
    reason: "Antioxidant that fades pigmentation and brightens over weeks.",
    category: "vitamin c serum",
    priority: "recommended",
  },
  dryness: {
    id: "concern-dryness",
    time: "PM",
    title: "Layer a humectant + occlusive at night",
    reason: "Hyaluronic acid then a richer cream reduces overnight water loss.",
    category: "hydrating serum",
    priority: "recommended",
  },
  sensitivity: {
    id: "concern-sensitivity",
    time: "PM",
    title: "Keep a barrier-repair cream on hand",
    reason: "Ceramide + cholesterol creams calm reactive, sensitised skin.",
    category: "barrier cream",
    priority: "recommended",
  },
  dullness: {
    id: "concern-dullness",
    time: "PM",
    title: "Low-strength exfoliating acid 1-2x/week",
    reason: "Gentle AHA boosts cell turnover for a brighter finish.",
    category: "aha treatment",
    priority: "optional",
  },
  hair_fall: {
    id: "concern-hairfall",
    time: "WASH",
    title: "Scalp serum + softer-water washing",
    reason: "Reduce mechanical and mineral stress on weakened follicles.",
    category: "scalp serum",
    priority: "recommended",
  },
  hair_frizz: {
    id: "concern-frizz",
    time: "WASH",
    title: "Leave-in conditioner after every wash",
    reason: "Seals raised cuticles lifted by hard-water calcification.",
    category: "leave-in conditioner",
    priority: "optional",
  },
  dandruff: {
    id: "concern-dandruff",
    time: "WASH",
    title: "Anti-fungal (ketoconazole/ZPT) shampoo 2x/week",
    reason: "Distinguish true dandruff from hard-water scalp flaking.",
    category: "anti-dandruff shampoo",
    priority: "recommended",
  },
};

export interface RoutineRequest {
  concerns: Concern[];
  water?: WaterProfile | null;
  aqi?: AqiReading | null;
}

export interface Routine {
  am: RoutineStep[];
  pm: RoutineStep[];
  wash: RoutineStep[];
  summary: string;
}

const priorityRank: Record<RoutineStep["priority"], number> = {
  critical: 0,
  recommended: 1,
  optional: 2,
};

/**
 * Compose a full, environment-aware, brand-agnostic routine.
 * Order of influence: environment (water + AQI) > concerns > base care.
 */
export function buildRoutine(req: RoutineRequest): Routine {
  const steps: RoutineStep[] = [...BASE_STEPS];

  for (const concern of req.concerns) {
    const step = CONCERN_STEPS[concern];
    if (step) steps.push(step);
  }
  if (req.water) steps.push(...waterRoutineSteps(req.water));
  if (req.aqi) steps.push(...aqiRoutineSteps(req.aqi));

  const byTime = (t: RoutineStep["time"]) =>
    steps
      .filter((s) => s.time === t)
      .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);

  const criticalCount = steps.filter((s) => s.priority === "critical").length;
  const summaryParts: string[] = [];
  if (req.water) {
    summaryParts.push(
      `${req.water.area} water (~${Math.round((req.water.tdsMin + req.water.tdsMax) / 2)} ppm TDS, ${req.water.risk.replace(/_/g, " ")})`,
    );
  }
  if (req.aqi) summaryParts.push(`AQI ${req.aqi.aqi}`);
  const summary =
    summaryParts.length > 0
      ? `Routine tuned for ${summaryParts.join(" + ")}. ${criticalCount} high-priority change(s) flagged.`
      : "Baseline routine. Add your locality and city to calibrate for water and air.";

  return {
    am: byTime("AM"),
    pm: byTime("PM"),
    wash: byTime("WASH"),
    summary,
  };
}
