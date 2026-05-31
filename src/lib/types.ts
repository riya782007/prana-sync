// Shared domain types for Prana Sync.

export type RiskLevel = "low" | "moderate" | "high" | "very_high";

export type Concern =
  | "hair_fall"
  | "hair_frizz"
  | "dryness"
  | "acne"
  | "sensitivity"
  | "pigmentation"
  | "dullness"
  | "dandruff";

export interface WaterProfile {
  /** Neighborhood / locality name. */
  area: string;
  city: string;
  primarySource: string;
  /** Total Dissolved Solids range in ppm (mg/L). */
  tdsMin: number;
  tdsMax: number;
  risk: RiskLevel;
  /** Observed biophysical issues common to this water profile. */
  pathologies: string[];
  /** Estimated annual cost of inaction per capita, in INR. */
  annualCostOfInactionInr: number;
}

export interface RoutineStep {
  id: string;
  /** When to do it. */
  time: "AM" | "PM" | "WASH";
  title: string;
  reason: string;
  /** Generic product category — brand agnostic. */
  category: string;
  /** Severity / priority of the recommendation. */
  priority: "critical" | "recommended" | "optional";
}

export interface EnvironmentContext {
  water?: WaterProfile | null;
  aqi?: AqiReading | null;
}

export interface AqiReading {
  station: string;
  aqi: number;
  category: AqiCategory;
  dominantPollutant?: string;
  updatedAt?: string;
}

export type AqiCategory =
  | "good"
  | "moderate"
  | "unhealthy_sensitive"
  | "unhealthy"
  | "very_unhealthy"
  | "hazardous";

export interface SkinScore {
  /** Overall 0-100 objective score. Higher is healthier. */
  overall: number;
  parameters: {
    name: string;
    /** 0-100, higher is healthier. */
    value: number;
  }[];
  notes: string[];
  /** Set when the analysis is heuristic (no LLM key configured). */
  simulated?: boolean;
  /** Set when the model could not clearly read a face (retake suggested). */
  lowConfidence?: boolean;
}

export interface ProductIngredients {
  productName: string;
  ingredients: string[];
}

export interface CompatibilityIssue {
  ingredientA: string;
  ingredientB: string;
  severity: "avoid" | "caution" | "separate_am_pm";
  reason: string;
}

export interface QuickCommerceLink {
  platform: "blinkit" | "zepto" | "instamart";
  label: string;
  url: string;
}
