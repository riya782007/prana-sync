import { z } from "zod";
import type { SkinScore } from "@/lib/types";
import {
  geminiConfigured,
  geminiGenerate,
  imagePart,
  parseJsonLoose,
  textPart,
} from "@/lib/llm/gemini";

/**
 * The 7 dimensions we score, with weights for the overall score. Barrier
 * health and hydration matter most for long-term skin health, so they carry
 * slightly more weight. For EVERY dimension, 100 = ideal/healthy.
 */
const SKIN_PARAMETERS: { name: string; weight: number; meaning: string }[] = [
  { name: "hydration", weight: 1.3, meaning: "100 = well hydrated, plump; 0 = very dehydrated, flaky" },
  { name: "barrier_health", weight: 1.3, meaning: "100 = intact, calm barrier; 0 = compromised, reactive" },
  { name: "redness", weight: 1.0, meaning: "100 = no visible redness; 0 = intense diffuse redness" },
  { name: "texture", weight: 1.0, meaning: "100 = smooth, even; 0 = rough, bumpy" },
  { name: "pigmentation", weight: 1.0, meaning: "100 = even tone; 0 = heavy dark spots / uneven tone" },
  { name: "pores", weight: 0.8, meaning: "100 = refined, barely visible; 0 = very enlarged/congested" },
  { name: "oiliness", weight: 0.8, meaning: "100 = balanced; 0 = very greasy OR very tight (imbalanced)" },
];

const PARAM_NAMES = SKIN_PARAMETERS.map((p) => p.name);

const SKIN_PROMPT = `You are an objective skin-image analysis engine for a wellness app (NOT a medical device).
Analyse the supplied photo and score the visible facial skin.

Return STRICT JSON only (no markdown), exactly this shape:
{
  "faceDetected": <true|false>,
  "parameters": [
    { "name": "hydration", "value": <0-100 integer> },
    { "name": "barrier_health", "value": <0-100 integer> },
    { "name": "redness", "value": <0-100 integer> },
    { "name": "texture", "value": <0-100 integer> },
    { "name": "pigmentation", "value": <0-100 integer> },
    { "name": "pores", "value": <0-100 integer> },
    { "name": "oiliness", "value": <0-100 integer> }
  ],
  "notes": [ "1-2 short, neutral, non-diagnostic observations" ]
}

Scoring rubric — for EVERY parameter, 100 = healthiest/ideal, 0 = worst:
- hydration: ${SKIN_PARAMETERS[0].meaning}
- barrier_health: ${SKIN_PARAMETERS[1].meaning}
- redness: ${SKIN_PARAMETERS[2].meaning}
- texture: ${SKIN_PARAMETERS[3].meaning}
- pigmentation: ${SKIN_PARAMETERS[4].meaning}
- pores: ${SKIN_PARAMETERS[5].meaning}
- oiliness: ${SKIN_PARAMETERS[6].meaning}

Hard rules:
- If no clear human face is visible, set "faceDetected": false and still return best-effort values.
- Be calibrated: reserve 90+ for visibly excellent skin and <40 for clearly problematic skin; most real skin lands 50-80.
- Do NOT diagnose any disease or condition. Do NOT name or recommend any brand or product.
- Output JSON only.`;

const modelSchema = z.object({
  faceDetected: z.boolean().optional(),
  parameters: z
    .array(z.object({ name: z.string(), value: z.coerce.number() }))
    .optional(),
  notes: z.array(z.string()).optional(),
});

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Deterministic weighted overall so the score is stable and trustworthy. */
function weightedOverall(values: Record<string, number>): number {
  let sum = 0;
  let weight = 0;
  for (const p of SKIN_PARAMETERS) {
    sum += (values[p.name] ?? 60) * p.weight;
    weight += p.weight;
  }
  return clamp(sum / weight);
}

/**
 * Analyse a skin photo. Uses Gemini vision when configured; otherwise returns a
 * deterministic simulated score so the demo works with zero keys. Validates the
 * model output with Zod, computes the overall score ourselves for consistency,
 * and retries once if the first response is unparseable.
 */
export async function analyzeSkin(imageDataUrl: string): Promise<SkinScore> {
  if (!geminiConfigured()) {
    return simulatedSkinScore();
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await geminiGenerate(
        [textPart(SKIN_PROMPT), imagePart(imageDataUrl)],
        { json: true, temperature: 0.15 },
      );

      const parsedJson = parseJsonLoose<unknown>(raw);
      const result = modelSchema.safeParse(parsedJson);
      if (!result.success) continue; // retry once

      const data = result.data;

      // Map model params -> our canonical 7, clamped; default 60 if missing.
      const values: Record<string, number> = {};
      for (const name of PARAM_NAMES) {
        const found = data.parameters?.find(
          (p) => p.name.toLowerCase().replace(/\s+/g, "_") === name,
        );
        values[name] = clamp(found?.value ?? 60);
      }

      const parameters = PARAM_NAMES.map((name) => ({
        name,
        value: values[name],
      }));
      const overall = weightedOverall(values);

      const notes = (data.notes ?? [])
        .map((n) => n.trim())
        .filter(Boolean)
        .slice(0, 4);

      const lowConfidence = data.faceDetected === false;
      if (lowConfidence) {
        notes.unshift(
          "We couldn't clearly detect a face — retake in even, front-on lighting for an accurate score.",
        );
      }

      return { overall, parameters, notes, lowConfidence };
    } catch {
      // network/API error — fall through to simulated baseline
      break;
    }
  }

  return simulatedSkinScore();
}

/** Deterministic placeholder used when no LLM key is configured. */
export function simulatedSkinScore(): SkinScore {
  const seed: Record<string, number> = {
    hydration: 58,
    barrier_health: 61,
    redness: 72,
    texture: 70,
    pigmentation: 63,
    pores: 65,
    oiliness: 68,
  };
  const parameters = PARAM_NAMES.map((name) => ({ name, value: seed[name] }));
  return {
    overall: weightedOverall(seed),
    parameters,
    notes: [
      "Simulated baseline — add a GEMINI_API_KEY to enable real photo analysis.",
      "Track this weekly to see how your routine changes your Skin Score.",
    ],
    simulated: true,
  };
}
