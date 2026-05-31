"use client";

import { useState } from "react";
import Link from "next/link";

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
  { id: "hair_frizz", label: "Frizz" },
  { id: "dandruff", label: "Dandruff / flaking" },
  { id: "dryness", label: "Dryness" },
  { id: "acne", label: "Acne" },
  { id: "sensitivity", label: "Sensitivity" },
  { id: "pigmentation", label: "Pigmentation" },
  { id: "dullness", label: "Dullness" },
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

function priorityColor(p: string) {
  if (p === "critical") return "border-red-500/40 bg-red-500/10";
  if (p === "recommended") return "border-prana-500/40 bg-prana-500/10";
  return "border-prana-900 bg-prana-900/20";
}

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

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-prana-100">
          Prana<span className="text-prana-500">Sync</span>
        </Link>
        <span className="text-xs text-prana-100/50">Demo dashboard</span>
      </div>

      {/* Environment calibration */}
      <section className="mt-8 rounded-2xl border border-prana-900 bg-prana-900/20 p-6">
        <h2 className="text-xl font-semibold text-prana-50">
          1 · Calibrate your environment
        </h2>
        <p className="mt-1 text-sm text-prana-100/70">
          Covers Delhi NCR, Mumbai, Bangalore, Hyderabad & Pune. Try Dwarka,
          Rohini, Gurgaon, Noida (Delhi NCR), Bandra (Mumbai), Gachibowli
          (Hyderabad) or Hinjewadi (Pune). Unknown locality? We fall back to a
          city-typical estimate.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-prana-100/70">Locality / neighbourhood</span>
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="mt-1 w-full rounded-lg border border-prana-900 bg-black/30 px-3 py-2 text-prana-50 outline-none focus:border-prana-500"
            />
          </label>
          <label className="text-sm">
            <span className="text-prana-100/70">City (for AQI)</span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded-lg border border-prana-900 bg-black/30 px-3 py-2 text-prana-50 outline-none focus:border-prana-500"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
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
          {routineLoading ? "Building…" : "Build my routine"}
        </button>

        {routine && (
          <div className="mt-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {routine.environment.water && (
                <div className="rounded-xl border border-prana-900 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-prana-100/50">
                    Water score · {routine.environment.water.area}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-prana-50">
                    {routine.environment.water.score}
                    <span className="text-base text-prana-100/50">/100</span>
                  </p>
                  <p className="mt-1 text-sm text-prana-100/70">
                    {routine.environment.water.tdsMin}–
                    {routine.environment.water.tdsMax} ppm TDS ·{" "}
                    {routine.environment.water.risk.replace(/_/g, " ")}
                  </p>
                  <p className="mt-2 text-sm text-prana-500">
                    Up to ₹
                    {routine.environment.water.annualSavingInr.toLocaleString(
                      "en-IN",
                    )}
                    /yr saved by fixing your water
                  </p>
                </div>
              )}
              {routine.environment.aqi && (
                <div className="rounded-xl border border-prana-900 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-prana-100/50">
                    Air quality · {routine.environment.aqi.station}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-prana-50">
                    {routine.environment.aqi.aqi}
                    <span className="text-base text-prana-100/50"> AQI</span>
                  </p>
                  <p className="mt-1 text-sm text-prana-100/70">
                    {routine.environment.aqi.category.replace(/_/g, " ")}
                  </p>
                </div>
              )}
            </div>

            <p className="text-sm text-prana-100/80">{routine.routine.summary}</p>

            <div className="grid gap-4 md:grid-cols-3">
              {(["am", "pm", "wash"] as const).map((slot) => (
                <div key={slot}>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-prana-500">
                    {slot === "wash" ? "Wash day" : slot.toUpperCase()}
                  </h3>
                  <div className="space-y-2">
                    {routine.routine[slot].map((s) => (
                      <div
                        key={s.id}
                        className={`rounded-lg border p-3 ${priorityColor(s.priority)}`}
                      >
                        <p className="text-sm font-medium text-prana-50">
                          {s.title}
                        </p>
                        <p className="mt-1 text-xs text-prana-100/60">
                          {s.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <SkinScan />
      <IngredientChecker />
      <RefillPlanner />

      <footer className="mt-12 text-xs text-prana-100/40">
        All sections work without keys (simulated). Configure GEMINI_API_KEY and
        WAQI_TOKEN to enable real analysis. Not a medical device.
      </footer>
    </main>
  );
}

/* ---------------- Skin scan ---------------- */
interface SkinScoreResult {
  score: {
    overall: number;
    parameters: { name: string; value: number }[];
    notes: string[];
    simulated?: boolean;
  };
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
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-prana-900 bg-prana-900/20 p-6">
      <h2 className="text-xl font-semibold text-prana-50">
        2 · Objective Skin Score
      </h2>
      <p className="mt-1 text-sm text-prana-100/70">
        Upload a selfie to get a brand-agnostic 0–100 Skin Score across 7
        parameters. Track it weekly to see what actually works.
      </p>

      <label className="mt-4 inline-block cursor-pointer rounded-full border border-prana-700 px-5 py-2.5 text-sm font-medium text-prana-100 hover:border-prana-500">
        {loading ? "Analysing…" : "Upload selfie"}
        <input
          type="file"
          accept="image/*"
          onChange={onFile}
          className="hidden"
        />
      </label>

      {result?.score && (
        <div className="mt-5">
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold text-prana-50">
              {result.score.overall}
              <span className="text-lg text-prana-100/50">/100</span>
            </p>
            {result.score.simulated && (
              <span className="mb-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                simulated
              </span>
            )}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {result.score.parameters.map((p) => (
              <div key={p.name}>
                <div className="flex justify-between text-xs text-prana-100/70">
                  <span className="capitalize">{p.name.replace(/_/g, " ")}</span>
                  <span>{p.value}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-black/40">
                  <div
                    className="h-full rounded-full bg-prana-500"
                    style={{ width: `${p.value}%` }}
                  />
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

/* ---------------- Ingredient checker ---------------- */
interface CompatResult {
  detectedActives: string[];
  issues: { ingredientA: string; ingredientB: string; severity: string; reason: string }[];
  verdict: string;
}

function IngredientChecker() {
  const [a, setA] = useState(
    "Aqua, Ascorbic Acid, Ferulic Acid, Tocopherol, Glycerin",
  );
  const [b, setB] = useState(
    "Aqua, Copper Tripeptide-1, Niacinamide, Glycerin, Panthenol",
  );
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
      <h2 className="text-xl font-semibold text-prana-50">
        3 · Ingredient compatibility
      </h2>
      <p className="mt-1 text-sm text-prana-100/70">
        Paste the ingredient lists of two products you own. We detect the
        actives and flag clashes — no brand bias.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <textarea
          value={a}
          onChange={(e) => setA(e.target.value)}
          rows={3}
          className="rounded-lg border border-prana-900 bg-black/30 p-3 text-sm text-prana-50 outline-none focus:border-prana-500"
        />
        <textarea
          value={b}
          onChange={(e) => setB(e.target.value)}
          rows={3}
          className="rounded-lg border border-prana-900 bg-black/30 p-3 text-sm text-prana-50 outline-none focus:border-prana-500"
        />
      </div>
      <button
        onClick={check}
        disabled={loading}
        className="mt-4 rounded-full bg-prana-600 px-5 py-2.5 font-medium text-white hover:bg-prana-500 disabled:opacity-50"
      >
        {loading ? "Checking…" : "Check compatibility"}
      </button>

      {result && (
        <div className="mt-5">
          <p className="text-sm text-prana-100/70">
            Detected actives:{" "}
            <span className="text-prana-100">
              {result.detectedActives.join(", ") || "none recognised"}
            </span>
          </p>
          {result.issues.length === 0 ? (
            <p className="mt-3 rounded-lg border border-prana-500/40 bg-prana-500/10 p-3 text-sm text-prana-100">
              No clashes detected — safe to layer.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {result.issues.map((i, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3"
                >
                  <p className="text-sm font-medium text-amber-200">
                    {i.ingredientA} × {i.ingredientB} — {i.severity.replace(/_/g, " ")}
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

/* ---------------- Refill planner ---------------- */
interface RefillResult {
  estimates: {
    name: string;
    daysRemaining: number;
    reorderNow: boolean;
    links: { platform: string; label: string; url: string }[];
  }[];
}

function RefillPlanner() {
  const [result, setResult] = useState<RefillResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function plan() {
    setLoading(true);
    const startedOn = new Date(Date.now() - 28 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    try {
      const res = await fetch("/api/refill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            { name: "probiotic capsules", packSize: 30, perDay: 1, startedOn },
            {
              name: "KDF shower filter cartridge",
              packSize: 90,
              perDay: 1,
              startedOn,
            },
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
      <h2 className="text-xl font-semibold text-prana-50">
        4 · One-tap refills
      </h2>
      <p className="mt-1 text-sm text-prana-100/70">
        We track depletion and deep-link a pre-filled cart into quick commerce
        before you run out. Example: a 30-day probiotic box started 28 days ago.
      </p>
      <button
        onClick={plan}
        disabled={loading}
        className="mt-4 rounded-full bg-prana-600 px-5 py-2.5 font-medium text-white hover:bg-prana-500 disabled:opacity-50"
      >
        {loading ? "Checking…" : "Check my refills"}
      </button>

      {result && (
        <div className="mt-5 space-y-3">
          {result.estimates.map((e) => (
            <div
              key={e.name}
              className="rounded-lg border border-prana-900 bg-black/20 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium capitalize text-prana-50">
                  {e.name}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    e.reorderNow
                      ? "bg-red-500/20 text-red-300"
                      : "bg-prana-500/20 text-prana-200"
                  }`}
                >
                  {e.daysRemaining} days left
                </span>
              </div>
              {e.reorderNow && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {e.links.map((l) => (
                    <a
                      key={l.platform}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-prana-700 px-3 py-1 text-xs text-prana-100 hover:border-prana-500"
                    >
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
