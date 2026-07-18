import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSitePage } from "@/lib/site-pages";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { RotatingWord } from "@/components/motion/rotating-word";
import { FloatingCard } from "@/components/motion/floating-card";

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

const PORTFOLIO_SHOWCASE = [
  { src: "/hero/camera-reveal.jpg", role: "Photographer" },
  { src: "/hero/finger-frame-portrait.jpg", role: "Content Creator" },
  { src: "/hero/beauty-campaign.jpg", role: "Grooming & Beauty" },
  { src: "/hero/overhead-collage.jpg", role: "Prop & Set Design" },
];

export default async function Home() {
  const page = await getSitePage<HomeContent>("home");
  const supabase = await createClient();
  const [{ data: categories }, { data: featuredProject }] = await Promise.all([
    supabase.from("categories").select("name").order("sort_order"),
    supabase
      .from("projects")
      .select(
        "title, budget_min, budget_max, categories(name), brand:profiles!projects_brand_id_fkey(city)"
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const content = page?.content;
  const tickerItems = categories?.length
    ? [...categories, ...categories]
    : [];
  const rotatingRoles = categories?.length
    ? categories.map((c) => c.name)
    : ["Photographer", "Videographer", "Graphic Designer"];

  return (
    <div>
      {/* Hero — dark, floating photo collage */}
      <section className="relative overflow-hidden bg-ink py-28 lg:py-40">
        <FloatingCard
          src="/hero/photographer-studio.jpg"
          alt=""
          caption="Photographer"
          sub="Nairobi"
          rotate={-6}
          delay={0.1}
          className="left-[3%] top-[10%] w-36 xl:w-40"
        />
        {featuredProject && (
          <FloatingCard
            src="/hero/videographer-set.png"
            alt=""
            caption={featuredProject.title}
            sub={`Ksh ${Number(featuredProject.budget_min).toLocaleString()}–${Number(featuredProject.budget_max).toLocaleString()} · ${featuredProject.brand?.city ?? "Kenya"}`}
            rotate={5}
            delay={0.2}
            className="right-[4%] top-[8%] w-40 xl:w-44"
          />
        )}
        <FloatingCard
          src="/hero/music-studio.png"
          alt=""
          caption="Music Producer"
          sub="Accra"
          rotate={4}
          delay={0.3}
          className="left-[7%] top-[62%] w-36 xl:w-40"
        />
        <FloatingCard
          src="/hero/ugc-creator.png"
          alt=""
          caption="Content Creator"
          sub="Lagos"
          rotate={-4}
          delay={0.15}
          className="right-[7%] top-[58%] w-36 xl:w-40"
        />
        <FloatingCard
          src="/hero/designer-desk.png"
          alt=""
          caption="Graphic Designer"
          sub="Nairobi"
          rotate={-3}
          delay={0.4}
          className="bottom-[6%] left-[18%] w-32 xl:w-36"
        />
        <FloatingCard
          src="/hero/director-clapperboard.jpg"
          alt=""
          caption="Director"
          sub="Kigali"
          rotate={6}
          delay={0.35}
          className="bottom-[8%] right-[17%] w-32 xl:w-36"
        />

        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-10">
          <Reveal mode="load">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-volt">
              {content?.hero.eyebrow ?? "Create. Connect. Thrive."}
            </p>
          </Reveal>
          <Reveal mode="load" delay={0.12}>
            <h1 className="font-display mt-6 text-5xl uppercase leading-[0.95] text-paper sm:text-6xl lg:text-7xl">
              {(content?.hero.headline ?? ["The Future", "of African", "Creativity."]).map(
                (line, i) => (
                  <span key={i} className="block">
                    {i === 1 ? <span className="text-volt">{line}</span> : line}
                  </span>
                )
              )}
            </h1>
          </Reveal>

          <Reveal mode="load" delay={0.26}>
            <Link
              href="/creatives"
              className="mt-10 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-paper/15 bg-paper/5 px-6 py-3.5 text-sm text-paper/80 backdrop-blur transition hover:border-paper/30 hover:bg-paper/10"
            >
              Hire the perfect
              <RotatingWord words={rotatingRoles} />
              here
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal mode="load" delay={0.38}>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href={content?.hero.cta_primary.href ?? "/creatives"}
                className="rounded-full bg-volt px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink transition hover:bg-paper"
              >
                {content?.hero.cta_primary.label ?? "Find Creatives"}
              </Link>
              <Link
                href={content?.hero.cta_secondary.href ?? "/projects/new"}
                className="rounded-full border border-paper/20 px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-paper transition hover:border-paper/50"
              >
                {content?.hero.cta_secondary.label ?? "Post a Project"}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-line bg-paper py-16">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 text-center sm:grid-cols-3 lg:px-10">
          <Reveal mode="load" delay={0.05}>
            <p className="font-accent text-5xl text-volt">{content?.hero.stat_value ?? "$4.2B"}</p>
            <p className="mt-2 text-xs uppercase tracking-widest text-ink/50">
              African creative economy
            </p>
          </Reveal>
          <Reveal mode="load" delay={0.15}>
            <p className="font-accent text-5xl text-volt">{categories?.length ?? 11}+</p>
            <p className="mt-2 text-xs uppercase tracking-widest text-ink/50">
              Creative disciplines
            </p>
          </Reveal>
          <Reveal mode="load" delay={0.25}>
            <p className="font-accent text-5xl text-volt">M-Pesa</p>
            <p className="mt-2 text-xs uppercase tracking-widest text-ink/50">
              Secured escrow payments
            </p>
          </Reveal>
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
          <Reveal>
            <h2 className="font-display text-4xl uppercase text-ink sm:text-5xl">
              How It Works
            </h2>
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-10 sm:grid-cols-3">
            {content.how_it_works.map((item) => (
              <StaggerItem key={item.step}>
                <p className="font-display text-5xl text-magenta">{item.step}</p>
                <h3 className="mt-4 text-lg font-semibold uppercase tracking-wide text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{item.body}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      )}

      {/* Portfolio showcase */}
      <section className="border-t border-line bg-ink py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-volt">
              Made on Nyx Creators Hub
            </p>
            <h2 className="font-display mt-3 text-4xl uppercase text-paper sm:text-5xl">
              Work from the community
            </h2>
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PORTFOLIO_SHOWCASE.map((item) => (
              <StaggerItem key={item.src}>
                <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-paper/10">
                  <Image
                    src={item.src}
                    alt={item.role}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-4">
                    <p className="text-sm font-semibold text-paper">{item.role}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Testimonials */}
      {content?.testimonials && (
        <section className="border-t border-line bg-paper py-24 text-ink">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <h2 className="font-display text-4xl uppercase sm:text-5xl">What Brands Say</h2>
            </Reveal>
            <StaggerGroup className="mt-12 grid gap-8 lg:grid-cols-3">
              {content.testimonials.map((t) => (
                <StaggerItem key={t.name}>
                  <blockquote className="h-full rounded-2xl border border-ink/10 bg-ink/[0.02] p-8 shadow-sm">
                    <p className="font-accent text-xl leading-snug text-ink/90">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="mt-6">
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-xs uppercase tracking-wide text-ink/50">{t.role}</p>
                    </footer>
                  </blockquote>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <Reveal>
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
      </Reveal>
    </div>
  );
}
