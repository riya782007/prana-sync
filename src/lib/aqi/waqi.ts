import type { AqiCategory, AqiReading, RoutineStep } from "@/lib/types";

const WAQI_BASE = "https://api.waqi.info";

function categorize(aqi: number): AqiCategory {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "unhealthy_sensitive";
  if (aqi <= 200) return "unhealthy";
  if (aqi <= 300) return "very_unhealthy";
  return "hazardous";
}

export function aqiCategoryLabel(category: AqiCategory): string {
  return {
    good: "Good",
    moderate: "Moderate",
    unhealthy_sensitive: "Unhealthy for sensitive groups",
    unhealthy: "Unhealthy",
    very_unhealthy: "Very unhealthy",
    hazardous: "Hazardous",
  }[category];
}

interface WaqiResponse {
  status: string;
  data?: {
    aqi: number;
    dominentpol?: string;
    city?: { name?: string };
    time?: { iso?: string };
  };
}

/**
 * Fetch the current AQI for a city/locality using the free WAQI (aqicn) API.
 * Falls back to a deterministic simulated reading when no token is configured,
 * so the product is fully demoable without any keys.
 */
export async function fetchAqi(city: string): Promise<AqiReading> {
  const token = process.env.WAQI_TOKEN;
  if (!token) {
    return simulatedAqi(city);
  }

  try {
    const res = await fetch(
      `${WAQI_BASE}/feed/${encodeURIComponent(city)}/?token=${token}`,
      { next: { revalidate: 1800 } },
    );
    const json = (await res.json()) as WaqiResponse;
    if (json.status !== "ok" || !json.data) {
      return simulatedAqi(city);
    }
    const aqi = json.data.aqi;
    return {
      station: json.data.city?.name ?? city,
      aqi,
      category: categorize(aqi),
      dominantPollutant: json.data.dominentpol,
      updatedAt: json.data.time?.iso,
    };
  } catch {
    return simulatedAqi(city);
  }
}

/** Deterministic stand-in so the UI works with zero keys configured. */
export function simulatedAqi(city: string): AqiReading {
  const seeds: Record<string, number> = {
    delhi: 312,
    "new delhi": 312,
    gurgaon: 268,
    noida: 254,
    mumbai: 96,
    bangalore: 78,
    bengaluru: 78,
    pune: 88,
    chennai: 84,
    hyderabad: 92,
    kolkata: 158,
  };
  const key = city.trim().toLowerCase();
  const aqi = seeds[key] ?? 110;
  return {
    station: `${city} (simulated)`,
    aqi,
    category: categorize(aqi),
    dominantPollutant: "pm25",
    updatedAt: new Date().toISOString(),
  };
}

/** Air-quality-adaptive routine additions. */
export function aqiRoutineSteps(reading: AqiReading): RoutineStep[] {
  const steps: RoutineStep[] = [];

  if (reading.aqi > 150) {
    steps.push({
      id: "aqi-antioxidant",
      time: "AM",
      title: "Layer an antioxidant serum (vitamin C / niacinamide) every morning",
      reason: `AQI is ${reading.aqi} (${reading.category.replace(/_/g, " ")}). Antioxidants neutralise pollution-driven free radicals that accelerate pigmentation and barrier damage.`,
      category: "antioxidant serum",
      priority: "critical",
    });
    steps.push({
      id: "aqi-double-cleanse",
      time: "PM",
      title: "Double cleanse at night to remove particulate matter",
      reason:
        "PM2.5 and soot adhere to sebum through the day. An oil-then-gel cleanse clears deposits before they clog pores.",
      category: "cleanser",
      priority: "recommended",
    });
    steps.push({
      id: "aqi-pause-actives",
      time: "PM",
      title: "Temporarily ease off strong exfoliating acids / high-strength retinol",
      reason:
        "On hazardous-air days a compromised barrier is more reactive. Reduce active strength to avoid irritation, then resume when AQI improves.",
      category: "actives management",
      priority: "recommended",
    });
  } else if (reading.aqi > 100) {
    steps.push({
      id: "aqi-spf-antioxidant",
      time: "AM",
      title: "Pair antioxidant + broad-spectrum SPF in the morning",
      reason: `AQI is ${reading.aqi} (moderate-plus). Antioxidant under SPF gives layered protection against pollution and UV.`,
      category: "antioxidant + spf",
      priority: "recommended",
    });
  } else {
    steps.push({
      id: "aqi-spf",
      time: "AM",
      title: "Daily broad-spectrum SPF",
      reason: `AQI is ${reading.aqi} (good-to-moderate). Maintain SPF; no pollution-specific changes needed today.`,
      category: "spf",
      priority: "optional",
    });
  }

  return steps;
}
