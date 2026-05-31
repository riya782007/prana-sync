import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeSkin } from "@/lib/llm/skin-analysis";

export const runtime = "nodejs";

const schema = z.object({
  // base64 data URL of the face photo
  image: z.string().min(16),
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
      { error: "image (base64 data URL) is required" },
      { status: 400 },
    );
  }

  try {
    const score = await analyzeSkin(parsed.data.image);
    return NextResponse.json({ score });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analysis failed" },
      { status: 500 },
    );
  }
}
