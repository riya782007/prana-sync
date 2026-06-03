"use client";

import { useState } from "react";
import Link from "next/link";
import type { SkinScore } from "@/lib/types";

type Concern =
  | "hair_fall"
  | "hair_frizz"
  | "dryness"
  | "acne"
  | "sensitivity"
  | "pigmentation"
  | "dullness"
  | "dandruff";

const CONCERNS: { id: Concern; label: string }[] = [
  { id: "hair_fall", label: "Hair fall" },
  { id: "hair_frizz", label: "Frizzy hair" },
  { id: "dandruff", label: "Dandruff / flaking" },
  { id: "dryness", label: "Dry skin" },
  { id: "acne", label: "Pimples" },
  { id: "sensitivity", label: "Sensitive skin" },
  { id: "pigmentation", label: "Dark spots" },
  { id: "dullness", label: "Dull skin" },
];

interface RoutineStep {
  id: string;
  time: string;
  title: string;
  reason: string;
  priority: string;
}
interface RoutineResult {
  routine: {
    am: RoutineStep[];
    pm: RoutineStep[];
    wash: RoutineStep[];
    summary: string;
  };
  environment: {
    water: {
      area: string;
      risk: string;
      tdsMin: number;
      tdsMax: number;
      score: number;
      annualSavingInr: number;
    } | null;
    aqi: { aqi: number; category: string; station: string } | null;
  };
}

/* ---- plain-language helpers ---- */

function hardnessWord(risk: string): { label: string; meaning: string; hard: boolean } {
  const r = risk.toLowerCase();
  if (r === "very_high" || r.includes("very"))
    return { label: "Very hard water", meaning: "Lots of minerals — this strongly dries out skin and roughens hair.", hard: true };
  if (r === "high" || r.includes("hard"))
    return { label: "Hard water", meaning: "Enough minerals to leave skin tight and hair rough over time.", hard: true };
  if (r === "moderate")
    return { label: "Medium water", meaning: "A little mineral load — manageable with small tweaks.", hard: false };
  return { label: "Soft water", meaning: "Gentle on skin and hair — lucky you.", hard: false };
}

function airWord(aqi: number): { label: string; meaning: string; tone: "good" | "warn" | "bad" } {
  if (aqi <= 100) return { label: "Air is okay today", meaning: "Nothing extra needed — your normal routine is fine.", tone: "good" };
  if (aqi <= 200) return { label: "Air is a bit polluted today", meaning: "We've added a proper evening cleanse to wash the day off.", tone: "warn" };
  return { label: "Air is bad today", meaning: "We've toned down strong products and added extra cleansing so your skin doesn't get irritated.", tone: "bad" };
}

function verdict(routine: RoutineResult, concerns: Concern[]): string {
  const water = routine.environment.water;
  const hairConcern = concerns.some((c) => c.startsWith("hair") || c === "dandruff");
  const target = hairConcern ? "your hair feeling rough or falling more" : "your skin feeling dry or tight";
  if (water && hardnessWord(water.risk).hard) {
    return `Here's the real reason: your tap water is ${hardnessWord(water.risk).label.toLowerCase()}. That's a big part of why ${target}. The few simple steps below are built for exactly that — give them two weeks and you'll feel the difference.`;
  }
  return `Good news — your water is gentle. The simple steps below are tuned to what you told us, so you're not wasting money on products you don't need.`;
}

const FRIENDLY_PARAM: Record<string, string> = {
  hydration: "Moisture",
  redness: "Calmness",
  pores: "Pores",
  texture: "Smoothness",
  pigmentation: "Even tone",
  oiliness: "Oil balance",
  barrier_health: "Skin strength",
};

export default function Dashboard() {
  const [area, setArea] = useState("Dwarka");
  const [city, setCity] = useState("Delhi");
  const [concerns, setConcerns] = useState<Concern[]>(["hair_fall", "dryness"]);
  const [routine, setRoutine] = useState<RoutineResult | null>(null);
  const [routineLoading, setRoutineLoading] = useState(false);

  async function generateRoutine() {
    setRoutineLoading(true);
    try {
      const res = await fetch("/api/routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, city, concerns }),
      });
      setRoutine(await res.json());
    } finally {
      setRoutineLoading(false);
    }
  }

  function toggleConcern(c: Concern) {
    setConcerns((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  const air = routine?.environment.aqi ? airWord(routine.environment.aqi.aqi) : null;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-prana-100">
          Prana<span className="text-prana-500">Sync</span>
        </Link>
        <span className="text-xs text-prana-100/50">Free · No sign-up</span>
      </div>

      {/* Step 1 — environment + routine */}
      <section className="mt-6 rounded-2xl border border-prana-900 bg-prana-900/20 p-6">
        <h2 className="text-xl font-semibold text-prana-50">
          Why is my skin and hair acting up?
        </h2>
        <p className="mt-1 text-sm text-prana-100/70">
          Just tell us where you live and what&apos;s bothering you. We&apos;ll
          show you the real reason in plain words.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-prana-100/70">Your area / neighbourhood</span>
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Dwarka, Bandra, Gachibowli"
              className="mt-1 w-full rounded-lg border border-prana-900 bg-black/30 px-3 py-2 text-prana-50 outline-none focus:border-prana-500"
            />
          </label>
          <label className="text-sm">
            <span className="text-prana-100/70">Your city</span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Delhi, Mumbai, Pune"
              className="mt-1 w-full rounded-lg border border-prana-900 bg-black/30 px-3 py-2 text-prana-50 outline-none focus:border-prana-500"
            />
          </label>
        </div>

        <p className="mt-4 text-sm text-prana-100/70">What&apos;s bothering you? (tap any)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CONCERNS.map((c) => (
            <button
              key={c.id}
              onClick={() => toggleConcern(c.id)}
              className={`rounded-full px-3 py-1 text-sm transition ${
                concerns.includes(c.id)
                  ? "bg-prana-600 text-white"
                  : "border border-prana-900 text-prana-100/70 hover:border-prana-500"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <button
          onClick={generateRoutine}
          disabled={routineLoading}
          className="mt-5 rounded-full bg-prana-600 px-5 py-2.5 font-medium text-white hover:bg-prana-500 disabled:opacity-50"
        >
          {routineLoading ? "Working it out…" : "Show me what's going on"}
        </button>

        {routine && (
          <div className="mt-6 space-y-5">
            {/* the human verdict */}
            <p className="rounded-xl border border-prana-500/40 bg-prana-500/10 p-4 text-[15px] leading-relaxed text-prana-50">
              {verdict(routine, concerns)}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {routine.environment.water && (
                <div className="rounded-xl border border-prana-900 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-prana-100/50">
                    Your water · {routine.environment.water.area}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-prana-50">
                    {hardnessWord(routine.environment.water.risk).label}
                  </p>
                  <p className="mt-1 text-sm text-prana-100/70">
                    {hardnessWord(routine.environment.water.risk).meaning}
                  </p>
                  {routine.environment.water.annualSavingInr > 0 && (
                    <p className="mt-2 text-sm text-prana-500">
                      Fixing this could save you about ₹
                      {routine.environment.water.annualSavingInr.toLocaleString("en-IN")} a year
                      on wasted products.
                    </p>
                  )}
                </div>
              )}
              {routine.environment.aqi && air && (
                <div className="rounded-xl border border-prana-900 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-prana-100/50">
                    Air around you · {routine.environment.aqi.station}
                  </p>
                  <p className={`mt-1 text-2xl font-bold ${air.tone === "bad" ? "text-red-300" : air.tone === "warn" ? "text-amber-300" : "text-prana-50"}`}>
                    {air.label}
                  </p>
                  <p className="mt-1 text-sm text-prana-100/70">{air.meaning}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-prana-100">Your simple plan</p>
              <div className="mt-2 grid gap-4 md:grid-cols-3">
                {([
                  ["am", "In the morning"],
                  ["pm", "At night"],
                  ["wash", "On wash days"],
                ] as const).map(([slot, label]) => (
                  <div key={slot}>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-prana-500">
                      {label}
                    </h3>
                    <div className="space-y-2">
                      {routine.routine[slot].map((s) => (
                        <div
                          key={s.id}
                          className="rounded-lg border border-prana-900 bg-prana-900/20 p-3"
                        >
                          <p className="text-sm font-medium text-prana-50">{s.title}</p>
                          <p className="mt-1 text-xs text-prana-100/60">{s.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <SkinScan />
      <IngredientChecker />
      <RefillPlanner />

      <footer className="mt-12 text-xs text-prana-100/40">
        Everyday skin and hair guidance — not a doctor, and not a diagnosis. Free
        to use, nothing to buy.
      </footer>
    </main>
  );
}

/* ---------------- Skin check ---------------- */
interface SkinScoreResult {
  score: SkinScore;
}

function SkinScan() {
  const [result, setResult] = useState<SkinScoreResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/skin/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      setResult((await res.json()) as SkinScoreResult);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-prana-900 bg-prana-900/20 p-6">
      <h2 className="text-xl font-semibold text-prana-50">How&apos;s my skin right now?</h2>
      <p className="mt-1 text-sm text-prana-100/70">
        Take a clear selfie in good light. We&apos;ll give you a simple skin
        health score out of 100 and point out what to focus on. Your photo is
        used only to score it — nothing is saved.
      </p>

      <label className="mt-4 inline-block cursor-pointer rounded-full border border-prana-700 px-5 py-2.5 text-sm font-medium text-prana-100 hover:border-prana-500">
        {loading ? "Checking your photo…" : "Take / upload selfie"}
        <input type="file" accept="image/*" onChange={onFile} className="hidden" />
      </label>

      {result?.score && (
        <div className="mt-5">
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold text-prana-50">
              {result.score.overall}
              <span className="text-lg text-prana-100/50">/100</span>
            </p>
            <p className="mb-1 text-sm text-prana-100/70">skin health</p>
          </div>
          {result.score.simulated && (
            <p className="mt-2 text-xs text-prana-100/40">
              Showing a sample score. Real photo scoring switches on once a
              Gemini key is added (see notes for the owner).
            </p>
          )}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {result.score.parameters.map((p) => (
              <div key={p.name}>
                <div className="flex justify-between text-xs text-prana-100/70">
                  <span>{FRIENDLY_PARAM[p.name] ?? p.name.replace(/_/g, " ")}</span>
                  <span>{p.value}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-black/40">
                  <div className="h-full rounded-full bg-prana-500" style={{ width: `${p.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          {result.score.notes.length > 0 && (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-prana-100/60">
              {result.score.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

/* ---------------- Do my products clash? ---------------- */
interface CompatResult {
  detectedActives: string[];
  issues: { ingredientA: string; ingredientB: string; severity: string; reason: string }[];
  verdict: string;
}

function IngredientChecker() {
  const [a, setA] = useState("Aqua, Ascorbic Acid, Ferulic Acid, Tocopherol, Glycerin");
  const [b, setB] = useState("Aqua, Copper Tripeptide-1, Niacinamide, Glycerin, Panthenol");
  const [result, setResult] = useState<CompatResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function check() {
    setLoading(true);
    try {
      const res = await fetch("/api/ingredients/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: [
            { productName: "Product A", text: a },
            { productName: "Product B", text: b },
          ],
        }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-prana-900 bg-prana-900/20 p-6">
      <h2 className="text-xl font-semibold text-prana-50">Do my two products clash?</h2>
      <p className="mt-1 text-sm text-prana-100/70">
        Copy the small-print ingredient list from the back of two products you
        own and paste them below. We&apos;ll tell you in plain words whether
        they&apos;re fine together or fighting each other.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <textarea
          value={a}
          onChange={(e) => setA(e.target.value)}
          rows={3}
          placeholder="Paste product 1's ingredients here"
          className="rounded-lg border border-prana-900 bg-black/30 p-3 text-sm text-prana-50 outline-none focus:border-prana-500"
        />
        <textarea
          value={b}
          onChange={(e) => setB(e.target.value)}
          rows={3}
          placeholder="Paste product 2's ingredients here"
          className="rounded-lg border border-prana-900 bg-black/30 p-3 text-sm text-prana-50 outline-none focus:border-prana-500"
        />
      </div>
      <button
        onClick={check}
        disabled={loading}
        className="mt-4 rounded-full bg-prana-600 px-5 py-2.5 font-medium text-white hover:bg-prana-500 disabled:opacity-50"
      >
        {loading ? "Checking…" : "Can I use these together?"}
      </button>

      {result && (
        <div className="mt-5">
          {result.issues.length === 0 ? (
            <p className="rounded-lg border border-prana-500/40 bg-prana-500/10 p-3 text-sm text-prana-100">
              👍 You&apos;re good — these two are safe to use together.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-prana-100/70">Heads up — a couple of things to know:</p>
              {result.issues.map((i, idx) => (
                <div key={idx} className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
                  <p className="text-sm font-medium text-amber-200">
                    {i.ingredientA} and {i.ingredientB}
                  </p>
                  <p className="mt-1 text-xs text-prana-100/70">{i.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ---------------- What am I about to run out of? ---------------- */
interface RefillEstimate {
  name: string;
  daysRemaining: number;
  reorderNow: boolean;
  links: { platform: string; label: string; url: string }[];
}

interface LocalItem {
  name: string;
  packSize: number;
  perDay: number;
  offsetDays: number;
}

const DEFAULT_ITEMS: LocalItem[] = [
  { name: "probiotic capsules", packSize: 30, perDay: 1, offsetDays: 28 },
  { name: "water filter cartridge", packSize: 90, perDay: 1, offsetDays: 28 },
];

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

function RefillPlanner() {
  const [items, setItems] = useState<LocalItem[]>(DEFAULT_ITEMS);
  const [estimates, setEstimates] = useState<RefillEstimate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", packSize: 30, perDay: 1 });

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setItems((prev) => [
      ...prev,
      { name: form.name.trim(), packSize: Number(form.packSize), perDay: Number(form.perDay), offsetDays: 0 },
    ]);
    setForm({ name: "", packSize: 30, perDay: 1 });
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function plan() {
    setLoading(true);
    try {
      const res = await fetch("/api/refill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((d) => ({
            name: d.name,
            packSize: d.packSize,
            perDay: d.perDay,
            startedOn: isoDaysAgo(d.offsetDays),
          })),
        }),
      });
      const json = await res.json();
      setEstimates(json.estimates ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-prana-900 bg-prana-900/20 p-6">
      <h2 className="text-xl font-semibold text-prana-50">What am I about to run out of?</h2>
      <p className="mt-1 text-sm text-prana-100/70">
        Add the things you use daily — supplements, filter cartridges, anything.
        We&apos;ll work out when they&apos;ll finish and give you a one-tap
        reorder before they do. We sell nothing; this is just to save you the
        bother of remembering.
      </p>

      <form onSubmit={addItem} className="mt-4 grid gap-2 sm:grid-cols-5">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="What is it?"
          className="sm:col-span-2 rounded-lg border border-prana-900 bg-black/30 px-3 py-2 text-sm text-prana-50 outline-none focus:border-prana-500"
        />
        <input
          type="number"
          min={1}
          value={form.packSize}
          onChange={(e) => setForm({ ...form, packSize: Number(e.target.value) })}
          placeholder="How many in a pack?"
          className="rounded-lg border border-prana-900 bg-black/30 px-3 py-2 text-sm text-prana-50 outline-none focus:border-prana-500"
        />
        <input
          type="number"
          min={0.1}
          step={0.1}
          value={form.perDay}
          onChange={(e) => setForm({ ...form, perDay: Number(e.target.value) })}
          placeholder="Used per day"
          className="rounded-lg border border-prana-900 bg-black/30 px-3 py-2 text-sm text-prana-50 outline-none focus:border-prana-500"
        />
        <button type="submit" className="rounded-lg bg-prana-600 px-3 py-2 text-sm font-medium text-white hover:bg-prana-500">
          Add
        </button>
      </form>

      {items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((i, idx) => (
            <span key={idx} className="flex items-center gap-2 rounded-full border border-prana-900 bg-black/20 px-3 py-1 text-xs text-prana-100/80">
              {i.name}
              <button onClick={() => removeItem(idx)} className="text-prana-100/40 hover:text-red-300" aria-label={`Remove ${i.name}`}>
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        onClick={plan}
        disabled={loading || items.length === 0}
        className="mt-4 rounded-full bg-prana-600 px-5 py-2.5 font-medium text-white hover:bg-prana-500 disabled:opacity-50"
      >
        {loading ? "Checking…" : "When will these run out?"}
      </button>

      {estimates && (
        <div className="mt-5 space-y-3">
          {estimates.length === 0 && (
            <p className="text-sm text-prana-100/60">Add something above and we&apos;ll track it for you.</p>
          )}
          {estimates.map((e) => (
            <div key={e.name} className="rounded-lg border border-prana-900 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium capitalize text-prana-50">{e.name}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs ${e.reorderNow ? "bg-red-500/20 text-red-300" : "bg-prana-500/20 text-prana-200"}`}>
                  {e.reorderNow ? "Running low" : `${e.daysRemaining} days left`}
                </span>
              </div>
              {e.reorderNow && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {e.links.map((l) => (
                    <a key={l.platform} href={l.url} target="_blank" rel="noreferrer" className="rounded-full border border-prana-700 px-3 py-1 text-xs text-prana-100 hover:border-prana-500">
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
