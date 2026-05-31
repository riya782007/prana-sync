import Link from "next/link";

const features = [
  {
    title: "Hyperlocal water calibration",
    body: "Your locality's water hardness (TDS) decides half your skin and hair fate. We map it down to the neighbourhood and adjust your routine — chelating wash, shower filter, barrier repair.",
  },
  {
    title: "Air-quality adaptive routing",
    body: "When AQI spikes, the app layers antioxidants, adds a double cleanse, and eases off strong actives so a stressed barrier doesn't break down.",
  },
  {
    title: "Brand-agnostic ingredient coach",
    body: "Scan the serums you already own. We flag clashes (vitamin C + copper peptides, retinol + AHA) and build a harmonised AM/PM schedule — no products to buy from us.",
  },
  {
    title: "1-tap refills, zero inventory",
    body: "We track depletion of your filter cartridge or probiotic box and deep-link a pre-filled cart into Blinkit, Zepto or Instamart before you run out.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <header className="flex items-center justify-between">
        <span className="text-lg font-semibold text-prana-100">
          Prana<span className="text-prana-500">Sync</span>
        </span>
        <Link
          href="/dashboard"
          className="rounded-full bg-prana-600 px-4 py-2 text-sm font-medium text-white hover:bg-prana-500"
        >
          Open the demo
        </Link>
      </header>

      <section className="mt-16 max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-prana-500">
          For urban India
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-prana-50 sm:text-5xl">
          Your skin and hair don&apos;t break in a vacuum. They break in your
          tap water and your city&apos;s air.
        </h1>
        <p className="mt-5 text-lg text-prana-100/80">
          Prana Sync is a brand-agnostic skin, hair and gut coach that adapts to
          your hyperlocal water hardness and air quality — then makes
          consistency effortless with one-tap refills.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-prana-600 px-6 py-3 font-medium text-white hover:bg-prana-500"
          >
            Try the live demo
          </Link>
          <a
            href="https://github.com"
            className="rounded-full border border-prana-700 px-6 py-3 font-medium text-prana-100 hover:border-prana-500"
          >
            Read the build plan
          </a>
        </div>
        <p className="mt-4 text-xs text-prana-100/50">
          Works with zero API keys (simulated data). Add a free Gemini + WAQI
          key to switch on real photo analysis and live AQI.
        </p>
      </section>

      <section className="mt-20 grid gap-5 sm:grid-cols-2">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-prana-900 bg-prana-900/20 p-6"
          >
            <h2 className="text-lg font-semibold text-prana-100">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-prana-100/70">
              {f.body}
            </p>
          </div>
        ))}
      </section>

      <footer className="mt-20 border-t border-prana-900 pt-6 text-xs text-prana-100/40">
        Prana Sync — preventive wellness tooling. Not a medical device; does not
        provide diagnosis or treatment.
      </footer>
    </main>
  );
}
