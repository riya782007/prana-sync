import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildReorderLinks, estimateDepletion } from "@/lib/commerce/deeplink";

export const runtime = "nodejs";

const itemSchema = z.object({
  name: z.string().min(1),
  packSize: z.number().positive(),
  perDay: z.number().positive(),
  startedOn: z.string(),
});

const schema = z.object({
  items: z.array(itemSchema).default([]),
  leadTimeDays: z.number().positive().optional(),
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
      { error: "items[] with name, packSize, perDay, startedOn required" },
      { status: 400 },
    );
  }

  const estimates = parsed.data.items.map((item) =>
    estimateDepletion(item, parsed.data.leadTimeDays),
  );

  return NextResponse.json({ estimates });
}

// Quick deep links for an arbitrary product query: /api/refill?q=probiotic%20capsules
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "q query param required" }, { status: 400 });
  }
  return NextResponse.json({ query: q, links: buildReorderLinks(q) });
}
