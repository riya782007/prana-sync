import type { ProductIngredients } from "@/lib/types";
import {
  geminiConfigured,
  geminiGenerate,
  imagePart,
  parseJsonLoose,
  textPart,
} from "@/lib/llm/gemini";

const OCR_PROMPT = `Read the product label in this image. Extract the product name and the full
ingredient (INCI) list. Return STRICT JSON only:
{ "productName": "<name or empty>", "ingredients": ["ingredient 1", "ingredient 2", ...] }
Split ingredients on commas. Do not invent ingredients. JSON only, no markdown.`;

interface RawOcr {
  productName?: string;
  ingredients?: string[];
}

/**
 * OCR an ingredient label from a photo using Gemini vision.
 * Throws if no key is configured (caller can fall back to manual text entry).
 */
export async function ocrIngredientLabel(
  imageDataUrl: string,
): Promise<ProductIngredients> {
  if (!geminiConfigured()) {
    throw new Error(
      "GEMINI_API_KEY not configured — paste the ingredient list manually instead.",
    );
  }

  const raw = await geminiGenerate(
    [textPart(OCR_PROMPT), imagePart(imageDataUrl)],
    { json: true, temperature: 0 },
  );
  const parsed = parseJsonLoose<RawOcr>(raw);

  return {
    productName: parsed?.productName?.trim() || "Scanned product",
    ingredients: (parsed?.ingredients ?? [])
      .map((i) => i.trim())
      .filter(Boolean),
  };
}

/**
 * Parse a manually pasted ingredient list (comma / newline separated).
 * Keyless path — always available.
 */
export function parseIngredientText(
  productName: string,
  text: string,
): ProductIngredients {
  return {
    productName: productName.trim() || "My product",
    ingredients: text
      .split(/[,\n;]+/)
      .map((i) => i.trim())
      .filter(Boolean),
  };
}
