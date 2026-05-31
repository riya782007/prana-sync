/**
 * Minimal Groq REST client (OpenAI-compatible chat completions).
 *
 * Groq runs Llama models on LPU hardware at very high tokens/sec with a free
 * tier and no billing setup. We use it as a fast, cheap fallback for
 * text-only generation (e.g. routine narration) when Gemini is unavailable or
 * rate-limited. Vision tasks always stay on Gemini.
 */

const GROQ_BASE = "https://api.groq.com/openai/v1";

export function groqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

function model(): string {
  return process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
}

interface GroqResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

export async function groqGenerate(
  prompt: string,
  options: { json?: boolean; temperature?: number } = {},
): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not configured");

  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: model(),
      temperature: options.temperature ?? 0.4,
      messages: [{ role: "user", content: prompt }],
      ...(options.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  const json = (await res.json()) as GroqResponse;
  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `Groq error ${res.status}`);
  }

  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Groq returned an empty response");
  return text;
}
