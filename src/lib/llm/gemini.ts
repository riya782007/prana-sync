/**
 * Minimal Google Gemini REST client (no SDK dependency).
 *
 * Why Gemini for the budget MVP:
 *  - Generous free tier via Google AI Studio (no credit card to start).
 *  - Natively multimodal: one model does skin-photo analysis AND ingredient
 *    label OCR, so we avoid paying for a separate vision/OCR vendor.
 *
 * Model is configurable via GEMINI_MODEL; default targets the high-RPD,
 * low-cost Flash-Lite tier which is ideal for free-tier volume.
 */

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

export function geminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function model(): string {
  return process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
}

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
}

interface GenerateOptions {
  /** Force JSON output. */
  json?: boolean;
  temperature?: number;
}

/**
 * Low-level call to Gemini generateContent. Accepts mixed text + inline image
 * parts. Throws when not configured or when the API returns an error.
 */
export async function geminiGenerate(
  parts: GeminiPart[],
  options: GenerateOptions = {},
): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not configured");

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature: options.temperature ?? 0.4,
      ...(options.json ? { responseMimeType: "application/json" } : {}),
    },
  };

  const res = await fetch(
    `${GEMINI_BASE}/models/${model()}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  const json = (await res.json()) as GeminiResponse;
  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `Gemini error ${res.status}`);
  }

  const text = json.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("")
    .trim();

  if (!text) throw new Error("Gemini returned an empty response");
  return text;
}

/** Build an inline image part from a base64 data URL or raw base64 string. */
export function imagePart(dataUrlOrBase64: string): GeminiPart {
  let mimeType = "image/jpeg";
  let data = dataUrlOrBase64;
  const match = /^data:(.+?);base64,(.*)$/s.exec(dataUrlOrBase64);
  if (match) {
    mimeType = match[1];
    data = match[2];
  }
  return { inlineData: { mimeType, data } };
}

export function textPart(text: string): GeminiPart {
  return { text };
}

/** Best-effort JSON extraction from a model response that may wrap JSON. */
export function parseJsonLoose<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
