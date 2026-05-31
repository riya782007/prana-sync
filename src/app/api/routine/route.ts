import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildRoutine } from "@/lib/routine/builder";
import { lookupWaterProfile, waterScore, annualSavingInr } from "@/lib/water/tds-data";
import { fetchAqi } from "@/lib/aqi/waqi";

export const runtime = "nodejs";

const concernEnum = z.enum([
  "hair_fall",
  "hair_frizz",
  "dryness",
  "acne",
  "sensitivity",
  "pigmentation",
  "dullness",
  "dandruff",
]);

const schema = z.object({
  area: z.string().optional(),
  city: z.string().optional(),
  concerns: z.array(concernEnum).default([]),
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
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { area, city, concerns } = parsed.data;
  const water = area ? lookupWaterProfile(area) : null;
  const aqi = city ? await fetchAqi(city) : null;

  const routine = buildRoutine({ concerns, water, aqi });

  return NextResponse.json({
    routine,
    environment: {
      water: water
        ? {
            ...water,
            score: waterScore(water),
            annualSavingInr: annualSavingInr(water),
          }
        : null,
      aqi,
    },
  });
}
