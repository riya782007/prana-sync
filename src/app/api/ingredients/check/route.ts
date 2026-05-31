import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkCompatibility, detectedActives } from "@/lib/ingredients/compatibility";
import { ocrIngredientLabel, parseIngredientText } from "@/lib/llm/ingredient-ocr";
import type { ProductIngredients } from "@/lib/types";

export const runtime = "nodejs";

const productSchema = z.object({
  productName: z.string().default("My product"),
  // either a ready ingredient array, or raw pasted text, or an image to OCR
  ingredients: z.array(z.string()).optional(),
  text: z.string().optional(),
  image: z.string().optional(),
});

const schema = z.object({
  products: z.array(productSchema).min(1),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "products[] is required" },
      { status: 400 },
    );
  }

  const resolved: ProductIngredients[] = [];
  try {
    for (const p of parsed.data.products) {
      if (p.ingredients && p.ingredients.length > 0) {
        resolved.push({ productName: p.productName, ingredients: p.ingredients });
      } else if (p.image) {
        resolved.push(await ocrIngredientLabel(p.image));
      } else if (p.text) {
        resolved.push(parseIngredientText(p.productName, p.text));
      }
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to read ingredients" },
      { status: 500 },
    );
  }

  if (resolved.length === 0) {
    return NextResponse.json(
      { error: "No ingredients could be resolved from the input" },
      { status: 400 },
    );
  }

  const issues = checkCompatibility(resolved);
  const actives = detectedActives(resolved);

  return NextResponse.json({
    products: resolved,
    detectedActives: actives,
    issues,
    verdict: issues.some((i) => i.severity === "avoid")
      ? "conflict"
      : issues.length > 0
        ? "needs_scheduling"
        : "compatible",
  });
}
