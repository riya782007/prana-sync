import Link from "next/link";

const features = [
  {
    emoji: "💧",
    title: "Your tap water, decoded",
    body: "In most Indian cities the water is hard — full of minerals that quietly dry out your skin and rough up your hair. We tell you how hard yours is, and exactly what to change.",
  },
  {
    emoji: "🌫️",
    title: "Today's air, handled",
    body: "On bad-pollution days your skin takes a hit. We check your city's air right now and adjust what you should do in the morning and at night.",
  },
  {
    emoji: "🧴",
    title: "Do my products clash?",
    body: "Got a shelf full of serums and creams? Paste what's on the back of two of them and we'll tell you, in plain words, whether they work together or fight each other.",
  },
  {
    emoji: "🛒",
    title: "Never run out",
    body: "Tell us what you use and we'll remind you before it finishes — with a one-tap reorder on Blinkit, Zepto or Instamart. We sell nothing; this is just handy.",
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
          Try it free
        </Link>
      </header>

      <section className="mt-16 max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-prana-500">
          Free · No sign-up · 2 minutes
        </p>
        <h1 className="mt-3 text-4xl font-bold leading-tight text-prana-50 sm:text-5xl">
          Your skin and hair aren&apos;t the problem. Your water and your
          city&apos;s air are.
        </h1>
        <p className="mt-5 text-lg text-prana-100/80">
          Tell us where you live. In under two minutes, Prana Sync shows you why
          your skin and hair behave the way they do — and the few simple things
          that actually fix it. No products to buy from us. No account. No catch.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-prana-600 px-6 py-3 font-medium text-white hover:bg-prana-500"
          >
            Show me what&apos;s going on →
          </Link>
        </div>
        <p className="mt-4 text-xs text-prana-100/50">
          Nothing to install. Nothing to pay. Just answers.
        </p>
      </section>

      <section className="mt-20 grid gap-5 sm:grid-cols-2">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-prana-900 bg-prana-900/20 p-6"
          >
            <div className="text-2xl">{f.emoji}</div>
            <h2 className="mt-2 text-lg font-semibold text-prana-100">{f.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-prana-100/70">
              {f.body}
            </p>
          </div>
        ))}
      </section>

      <footer className="mt-20 border-t border-prana-900 pt-6 text-xs text-prana-100/40">
        Prana Sync gives everyday skin and hair guidance. It is not a doctor and
        does not diagnose or treat any condition.
      </footer>
    </main>
  );
}
