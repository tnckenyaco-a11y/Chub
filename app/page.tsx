import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Lock, Search, Sparkles } from "lucide-react";
import { getSitePage } from "@/lib/site-pages";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { RotatingWord } from "@/components/motion/rotating-word";
import { HeroParallaxContainer, ParallaxLayer } from "@/components/motion/hero-parallax";
import { CountUp } from "@/components/motion/count-up";

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

const STEP_ICONS = [Search, Lock, CheckCircle2];

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

  // Public aggregate only (no PII) — orders RLS restricts SELECT to the
  // order's own parties, so this reads through a SECURITY DEFINER function
  // instead of the service-role client (which needs a key not set in every env).
  const { data: totalPaidOutRaw } = await supabase.rpc("total_paid_to_creatives");
  const totalPaidOut = Number(totalPaidOutRaw ?? 0);

  const content = page?.content;
  const tickerItems = categories?.length ? [...categories, ...categories] : [];
  const rotatingRoles = categories?.length
    ? categories.map((c) => c.name)
    : ["Photographer", "Videographer", "Graphic Designer"];
  const headlineLines = content?.hero.headline ?? ["The Future", "of African Creativity."];
  const [headlineLine1, ...rest] = headlineLines;
  const headlineLine2 = rest.join(" ");

  return (
    <div>
      {/* Hero — animated gradient, mouse-parallax floating collage */}
      <section className="bg-hero-gradient relative -mx-3 -mt-3 overflow-hidden py-32 sm:-mx-6 lg:py-44">
        <HeroParallaxContainer className="pointer-events-none absolute inset-0">
          <ParallaxLayer depth={18} className="absolute left-[3%] top-[10%] hidden lg:block">
            <HeroFloatImage src="/hero/photographer-studio.jpg" caption="Photographer" sub="Nairobi" rotate={-6} />
          </ParallaxLayer>
          <ParallaxLayer depth={28} className="absolute bottom-[8%] left-[8%] hidden lg:block">
            <HeroFloatImage src="/hero/music-studio.png" caption="Music Producer" sub="Accra" rotate={4} />
          </ParallaxLayer>
          <ParallaxLayer depth={22} className="absolute right-[4%] top-[8%] hidden lg:block">
            <HeroFloatImage src="/hero/ugc-creator.png" caption="Content Creator" sub="Lagos" rotate={-4} />
          </ParallaxLayer>
          <ParallaxLayer depth={32} className="absolute bottom-[6%] right-[9%] hidden lg:block">
            <HeroFloatImage src="/hero/director-clapperboard.jpg" caption="Director" sub="Kigali" rotate={6} />
          </ParallaxLayer>
          {featuredProject && (
            <ParallaxLayer depth={14} className="pointer-events-auto absolute left-[18%] top-[16%] hidden xl:block">
              <div className="flex max-w-[190px] items-center gap-2.5 rounded-2xl bg-paper/95 p-3.5 shadow-2xl backdrop-blur">
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                  <Image src="/hero/finger-frame-portrait.jpg" alt="" fill sizes="36px" className="object-cover" />
                </div>
                <div>
                  <p className="text-[11.5px] font-semibold leading-tight text-ink">{featuredProject.title}</p>
                  <p className="mt-0.5 text-[10px] text-ink/50">Posted recently</p>
                </div>
              </div>
            </ParallaxLayer>
          )}
          <ParallaxLayer depth={20} className="pointer-events-auto absolute bottom-[12%] right-[16%] hidden xl:block">
            <div className="flex items-center gap-2.5 rounded-full bg-paper/95 py-2 pl-2 pr-4 shadow-2xl backdrop-blur">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                <Image src="/hero/camera-reveal.jpg" alt="" fill sizes="36px" className="object-cover" />
              </div>
              <div>
                <p className="text-[11.5px] font-semibold leading-tight text-ink">Kwame Boateng</p>
                <p className="text-[10px] text-ink/50">Photographer, Director</p>
              </div>
            </div>
          </ParallaxLayer>
        </HeroParallaxContainer>

        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-10">
          <Reveal mode="load">
            <p className="font-accent text-lg text-[#ffb87a] sm:text-xl">
              {content?.hero.eyebrow ?? "Create. Connect. Thrive."}
            </p>
          </Reveal>
          <Reveal mode="load" delay={0.12}>
            <h1 className="font-display mt-5 text-5xl leading-[1.05] text-paper sm:text-6xl lg:text-7xl">
              {headlineLine1}
              <span className="block bg-gradient-to-r from-[#ffb87a] to-volt bg-clip-text text-transparent">
                {headlineLine2}
              </span>
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
            </Link>
          </Reveal>

          <Reveal mode="load" delay={0.38}>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href={content?.hero.cta_primary.href ?? "/creatives"}
                className="rounded-full bg-grad-brand px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-paper shadow-[0_14px_30px_rgba(133,20,144,0.3)] transition hover:opacity-90"
              >
                {content?.hero.cta_primary.label ?? "Find Creatives"}
              </Link>
              <Link
                href={content?.hero.cta_secondary.href ?? "/projects/new"}
                className="rounded-full border border-paper/25 px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-paper transition hover:border-paper/50"
              >
                {content?.hero.cta_secondary.label ?? "Post a Project"}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats block */}
      <section className="bg-paper py-14">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <Reveal>
            <div className="grid divide-y divide-line overflow-hidden rounded-2xl border border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="p-8 text-center">
                <p className="font-accent text-3xl text-brand">{content?.hero.stat_value ?? "$4.2B"}</p>
                <p className="mt-2 text-xs uppercase tracking-widest text-ink/50">
                  African creative economy
                </p>
              </div>
              <div className="p-8 text-center">
                <CountUp
                  target={categories?.length ?? 11}
                  suffix="+"
                  className="font-display block text-3xl font-bold text-brand"
                />
                <p className="mt-2 text-xs uppercase tracking-widest text-ink/50">
                  Creative disciplines
                </p>
              </div>
              <div className="p-8 text-center">
                <CountUp
                  target={totalPaidOut}
                  prefix="Ksh "
                  className="font-display block text-3xl font-bold text-brand"
                />
                <p className="mt-2 text-xs uppercase tracking-widest text-ink/50">
                  Paid to creatives
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Category ticker */}
      {tickerItems.length > 0 && (
        <div className="overflow-hidden border-y border-line bg-paper py-4">
          <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
            {tickerItems.map((c, i) => (
              <span key={i} className="font-display text-2xl uppercase text-ink/80">
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
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
              Made on Nyx Creators Hub
            </p>
            <h2 className="font-display mt-3 text-4xl text-ink sm:text-5xl">How It Works</h2>
          </Reveal>
          <StaggerGroup className="relative mt-14 grid gap-10 sm:grid-cols-3">
            <div className="pointer-events-none absolute inset-x-[16%] top-[23px] hidden h-0.5 sm:block [background:repeating-linear-gradient(90deg,var(--color-line)_0_10px,transparent_10px_18px)]" />
            {content.how_it_works.map((item, i) => {
              const Icon = STEP_ICONS[i % STEP_ICONS.length];
              return (
                <StaggerItem key={item.step}>
                  <div className="relative text-center">
                    <div className="bg-grad-brand relative z-10 mx-auto flex h-[46px] w-[46px] items-center justify-center rounded-full text-base font-bold text-paper shadow-[0_10px_22px_rgba(133,20,144,0.3)]">
                      {item.step}
                    </div>
                    <div className="mx-auto mt-3.5 flex h-8 w-8 items-center justify-center rounded-[10px] bg-brand/8 text-brand">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-display mt-3.5 text-xl text-ink">{item.title}</h3>
                    <p className="mx-auto mt-2.5 max-w-[260px] text-sm leading-relaxed text-ink/60">
                      {item.body}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </section>
      )}

      {/* Built for how you work */}
      <section className="border-t border-line py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
              See it in action
            </p>
            <h2 className="font-display mt-3 text-4xl text-ink sm:text-5xl">
              Built for how you work
            </h2>
          </Reveal>

          <StaggerGroup className="mt-12 grid gap-6 lg:grid-cols-3">
            {["Creative Dashboard", "Creative Profile", "Platform Settings"].map((label) => (
              <StaggerItem key={label}>
                <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
                  <div className="flex gap-1.5 bg-bg px-3.5 py-2.5">
                    <span className="h-2 w-2 rounded-full bg-ink/15" />
                    <span className="h-2 w-2 rounded-full bg-ink/15" />
                    <span className="h-2 w-2 rounded-full bg-ink/15" />
                  </div>
                  <div className="flex aspect-video items-center justify-center bg-[repeating-linear-gradient(135deg,var(--color-bg)_0_10px,#ebe7e8_10px_20px)] px-4 text-center text-xs text-ink/35">
                    {label} preview
                  </div>
                </div>
                <p className="mt-3.5 text-center text-sm font-semibold text-ink">{label}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal delay={0.1}>
            <div className="bg-grad-brand mt-8 flex flex-col items-center gap-5 rounded-[20px] p-7 text-center sm:flex-row sm:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paper/15 text-paper">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h3 className="font-display text-lg text-paper">Nyx, your AI assistant</h3>
                  <span className="rounded-full bg-paper/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-paper">
                    Coming soon
                  </span>
                </div>
                <p className="mt-1 max-w-lg text-sm text-paper/70">
                  We&apos;re building an AI assistant into every dashboard to help with payouts,
                  proposals, and order status. It&apos;s on the roadmap — not live yet.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Portfolio showcase */}
      <section className="border-t border-line bg-ink py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-volt">
              Made on Nyx Creators Hub
            </p>
            <h2 className="font-display mt-3 text-4xl text-paper sm:text-5xl">
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
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                Testimonials
              </p>
              <h2 className="font-display mt-3 text-4xl sm:text-5xl">What Brands Say</h2>
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
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <Reveal>
          <div className="rounded-[28px] bg-ink px-8 py-16 text-center sm:px-16">
            <h2 className="font-display text-4xl text-paper sm:text-5xl">Join the movement.</h2>
            <p className="mx-auto mt-4 max-w-xl text-paper/65">
              Let&apos;s build the future of African creativity, together.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/sign-up?role=creative"
                className="bg-grad-volt rounded-full px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink transition hover:opacity-90"
              >
                Join as a Creative
              </Link>
              <Link
                href="/sign-up?role=brand"
                className="rounded-full border border-paper/25 px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-paper transition hover:border-paper/50"
              >
                Join as a Brand
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function HeroFloatImage({
  src,
  caption,
  sub,
  rotate,
}: {
  src: string;
  caption: string;
  sub: string;
  rotate: number;
}) {
  return (
    <div
      className="relative h-44 w-36 overflow-hidden rounded-2xl border border-paper/10 shadow-2xl xl:h-48 xl:w-40"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <Image src={src} alt="" fill sizes="160px" className="object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent p-3 pt-8">
        <p className="text-xs font-semibold leading-tight text-paper">{caption}</p>
        <p className="mt-0.5 text-[11px] leading-tight text-paper/70">{sub}</p>
      </div>
    </div>
  );
}
