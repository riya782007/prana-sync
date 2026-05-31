import type { SkinScore } from "@/lib/types";
import {
  geminiConfigured,
  geminiGenerate,
  imagePart,
  parseJsonLoose,
  textPart,
} from "@/lib/llm/gemini";

const SKIN_PARAMETERS = [
  "hydration",
  "redness",
  "pores",
  "texture",
  "pigmentation",
  "oiliness",
  "barrier_health",
];

const SKIN_PROMPT = `You are a dermatology-aware skin analysis engine. Analyse the face photo and
return STRICT JSON with this shape:
{
  "overall": <0-100 integer, higher = healthier skin>,
  "parameters": [ { "name": "hydration", "value": <0-100> }, ... for hydration, redness, pores, texture, pigmentation, oiliness, barrier_health ],
  "notes": [ "short, neutral, non-diagnostic observations" ]
}
Rules: Be objective and conservative. Do NOT diagnose disease. Do NOT recommend
specific brands. Higher value = healthier for every parameter (e.g. high "redness"
value means LOW redness). Output JSON only, no markdown.`;

interface RawSkin {
  overall?: number;
  parameters?: { name?: string; value?: number }[];
  notes?: string[];
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Analyse a skin photo. Uses Gemini vision when configured; otherwise returns a
 * deterministic simulated score so the demo works with zero keys.
 */
export async function analyzeSkin(imageDataUrl: string): Promise<SkinScore> {
  if (!geminiConfigured()) {
    return simulatedSkinScore();
  }

  try {
    const raw = await geminiGenerate(
      [textPart(SKIN_PROMPT), imagePart(imageDataUrl)],
      { json: true, temperature: 0.2 },
    );
    const parsed = parseJsonLoose<RawSkin>(raw);
    if (!parsed) return simulatedSkinScore();

    const parameters = SKIN_PARAMETERS.map((name) => {
      const found = parsed.parameters?.find(
        (p) => (p.name ?? "").toLowerCase() === name,
      );
      return { name, value: clamp(found?.value ?? 60) };
    });

    const overall =
      typeof parsed.overall === "number"
        ? clamp(parsed.overall)
        : clamp(
            parameters.reduce((s, p) => s + p.value, 0) / parameters.length,
          );

    return {
      overall,
      parameters,
      notes: (parsed.notes ?? []).slice(0, 5),
    };
  } catch {
    return simulatedSkinScore();
  }
}

/** Deterministic placeholder used when no LLM key is configured. */
export function simulatedSkinScore(): SkinScore {
  const parameters = [
    { name: "hydration", value: 58 },
    { name: "redness", value: 72 },
    { name: "pores", value: 65 },
    { name: "texture", value: 70 },
    { name: "pigmentation", value: 63 },
    { name: "oiliness", value: 68 },
    { name: "barrier_health", value: 61 },
  ];
  const overall = clamp(
    parameters.reduce((s, p) => s + p.value, 0) / parameters.length,
  );
  return {
    overall,
    parameters,
    notes: [
      "Simulated baseline — add a GEMINI_API_KEY to enable real photo analysis.",
      "Track this weekly to see how your routine changes your Skin Score.",
    ],
    simulated: true,
  };
}
