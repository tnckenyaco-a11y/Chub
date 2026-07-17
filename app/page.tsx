import Link from "next/link";
import { getSitePage } from "@/lib/site-pages";
import { createClient } from "@/lib/supabase/server";

type HomeContent = {
  hero: {
    eyebrow: string;
    headline: string[];
    stat_value: string;
    stat_label: string;
    cta_primary: { label: string; href: string };
    cta_secondary: { label: string; href: string };
  };
  how_it_works: { step: string; title: string; body: string }[];
  testimonials: { name: string; role: string; quote: string }[];
};

export default async function Home() {
  const page = await getSitePage<HomeContent>("home");
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("name")
    .order("sort_order");

  const content = page?.content;
  const tickerItems = categories?.length
    ? [...categories, ...categories]
    : [];

  return (
    <div>
      {/* Hero — asymmetric, oversized display type */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-6 lg:px-10 lg:py-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-volt">
              {content?.hero.eyebrow ?? "Create. Connect. Thrive."}
            </p>
            <h1 className="font-display mt-6 text-6xl uppercase leading-[0.95] text-ink sm:text-7xl lg:text-8xl">
              {(content?.hero.headline ?? ["The Future", "of African", "Creativity."]).map(
                (line, i) => (
                  <span key={i} className="block">
                    {i === 1 ? <span className="text-magenta">{line}</span> : line}
                  </span>
                )
              )}
            </h1>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={content?.hero.cta_primary.href ?? "/creatives"}
                className="rounded-full bg-volt px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink transition hover:bg-ink hover:text-paper"
              >
                {content?.hero.cta_primary.label ?? "Find Creatives"}
              </Link>
              <Link
                href={content?.hero.cta_secondary.href ?? "/projects/new"}
                className="rounded-full border border-line px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink transition hover:border-ink"
              >
                {content?.hero.cta_secondary.label ?? "Post a Project"}
              </Link>
            </div>
          </div>

          <div className="lg:justify-self-end">
            <p className="font-accent text-7xl text-volt sm:text-8xl">
              {content?.hero.stat_value ?? "$4.2B"}
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/60">
              {content?.hero.stat_label}
            </p>
          </div>
        </div>
      </section>

      {/* Category ticker */}
      {tickerItems.length > 0 && (
        <div className="overflow-hidden border-b border-line bg-paper py-4">
          <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
            {tickerItems.map((c, i) => (
              <span
                key={i}
                className="font-display text-2xl uppercase text-ink/80"
              >
                {c.name} <span className="text-magenta">·</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      {content?.how_it_works && (
        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <h2 className="font-display text-4xl uppercase text-ink sm:text-5xl">
            How It Works
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {content.how_it_works.map((item) => (
              <div key={item.step}>
                <p className="font-display text-5xl text-magenta">{item.step}</p>
                <h3 className="mt-4 text-lg font-semibold uppercase tracking-wide text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {content?.testimonials && (
        <section className="border-t border-line bg-paper py-24 text-ink">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <h2 className="font-display text-4xl uppercase sm:text-5xl">What Brands Say</h2>
            <div className="mt-12 grid gap-8 lg:grid-cols-3">
              {content.testimonials.map((t) => (
                <blockquote
                  key={t.name}
                  className="rounded-2xl border border-ink/10 bg-ink/[0.02] p-8 shadow-sm"
                >
                  <p className="font-accent text-xl leading-snug text-ink/90">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-6">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs uppercase tracking-wide text-ink/50">{t.role}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-10">
        <h2 className="font-display text-4xl uppercase text-ink sm:text-5xl">
          Join the movement.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-ink/60">
          Let&apos;s build the future of African creativity, together.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/sign-up?role=creative"
            className="rounded-full bg-volt px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink transition hover:bg-ink hover:text-paper"
          >
            Join as a Creative
          </Link>
          <Link
            href="/sign-up?role=brand"
            className="rounded-full border border-line px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink transition hover:border-ink"
          >
            Join as a Brand
          </Link>
        </div>
      </section>
    </div>
  );
}
