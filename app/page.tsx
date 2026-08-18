import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  FileText,
  Landmark,
  Lock,
  MessageCircle,
  Package,
  Repeat,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { getSitePage } from "@/lib/site-pages";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/motion/reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { RotatingWord } from "@/components/motion/rotating-word";
import { HeroParallaxContainer, ParallaxLayer } from "@/components/motion/hero-parallax";
import { CountUp } from "@/components/motion/count-up";
import { LottieIcon } from "@/components/motion/lottie-icon";
import { EarningsChart, type MonthlyPoint } from "@/components/earnings-chart";
import { ActivityFeed, type ActivityItem } from "@/components/activity-feed";

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
const TEASER_ICONS = [ShieldCheck, Landmark, Repeat];

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

const CREATIVE_PREVIEW_EARNINGS: MonthlyPoint[] = [
  { label: "Mar", value: 8000 },
  { label: "Apr", value: 15000 },
  { label: "May", value: 12000 },
  { label: "Jun", value: 22000 },
  { label: "Jul", value: 18000 },
  { label: "Aug", value: 31000 },
];

const CREATIVE_PREVIEW_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    icon: CheckCircle2,
    iconClass: "bg-green/10 text-green",
    text: "Payment released — order completed",
    time: hoursAgo(4),
  },
  {
    id: "2",
    icon: Star,
    iconClass: "bg-volt/10 text-volt",
    text: "New 5★ review received",
    time: hoursAgo(26),
  },
  {
    id: "3",
    icon: Users,
    iconClass: "bg-brand/10 text-brand",
    text: 'New squad invite for "Product Launch"',
    time: hoursAgo(48),
  },
];

const BRAND_PREVIEW_SPEND: MonthlyPoint[] = [
  { label: "Mar", value: 18000 },
  { label: "Apr", value: 12000 },
  { label: "May", value: 20000 },
  { label: "Jun", value: 25000 },
  { label: "Jul", value: 30000 },
  { label: "Aug", value: 50000 },
];

const ESCROW_PREVIEW_ROWS: {
  title: string;
  date: string;
  amount: number;
  status: string;
  statusClass: string;
}[] = [
  {
    title: "Brand Identity & Logo Design",
    date: "Aug 12",
    amount: 30000,
    status: "Successful",
    statusClass: "bg-green/10 text-green",
  },
  {
    title: "Video Editing — Social Media",
    date: "Aug 5",
    amount: 50000,
    status: "In Escrow",
    statusClass: "bg-brand/10 text-brand",
  },
];

const BRAND_PREVIEW_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    icon: FileText,
    iconClass: "bg-brand/10 text-brand",
    text: 'New proposal on "Graphic designer needed"',
    time: hoursAgo(6),
  },
  {
    id: "2",
    icon: Package,
    iconClass: "bg-green/10 text-green",
    text: "Order marked completed",
    time: hoursAgo(30),
  },
  {
    id: "3",
    icon: MessageCircle,
    iconClass: "bg-brand/10 text-brand",
    text: "New message received",
    time: hoursAgo(52),
  },
];

type FinancialProductsTeaser = {
  teaser: {
    eyebrow: string;
    title: string;
    body: string;
    bullets: string[];
    cta_label: string;
    cta_href: string;
  };
};

export default async function Home() {
  const [page, financialProductsPage] = await Promise.all([
    getSitePage<HomeContent>("home"),
    getSitePage<FinancialProductsTeaser>("financial_products"),
  ]);
  const teaser = financialProductsPage?.content.teaser;
  const supabase = await createClient();
  const [{ data: categories }, { data: featuredProject }] = await Promise.all([
    supabase.from("categories").select("name").order("sort_order"),
    supabase
      .from("projects")
      .select("title")
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

          <StaggerGroup className="mt-12">
            <div className="grid gap-6 lg:grid-cols-2">
              <StaggerItem>
                <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
                  <div className="flex items-center justify-between bg-bg px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-ink/15" />
                      <span className="h-2 w-2 rounded-full bg-ink/15" />
                      <span className="h-2 w-2 rounded-full bg-ink/15" />
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                      Creative Dashboard
                    </p>
                  </div>
                  <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <EarningsChart title="Earnings" emptyLabel="" data={CREATIVE_PREVIEW_EARNINGS} />
                    </div>
                    <ActivityFeed items={CREATIVE_PREVIEW_ACTIVITY} />
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
                  <div className="flex items-center justify-between bg-bg px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-ink/15" />
                      <span className="h-2 w-2 rounded-full bg-ink/15" />
                      <span className="h-2 w-2 rounded-full bg-ink/15" />
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                      Brand Dashboard
                    </p>
                  </div>
                  <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <EarningsChart title="Spend" emptyLabel="" data={BRAND_PREVIEW_SPEND} />
                    </div>
                    <ActivityFeed items={BRAND_PREVIEW_ACTIVITY} />
                  </div>
                </div>
              </StaggerItem>
            </div>

            <StaggerItem>
              <div className="mx-auto mt-6 w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
                <div className="flex items-center gap-2.5 bg-bg px-5 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green/10 text-green">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                      Escrow &amp; Payments
                    </p>
                    <p className="text-[11px] text-ink/40">Released the moment work is approved</p>
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  {ESCROW_PREVIEW_ROWS.map((row) => (
                    <div
                      key={row.title}
                      className="flex items-center justify-between rounded-xl border border-line px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{row.title}</p>
                        <p className="mt-0.5 text-xs text-ink/40">{row.date}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-display text-sm text-ink">Ksh {row.amount.toLocaleString()}</p>
                        <span
                          className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${row.statusClass}`}
                        >
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>
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
                    Live
                  </span>
                </div>
                <p className="mt-1 max-w-lg text-sm text-paper/70">
                  Built into every dashboard — ask about your orders, proposals, or earnings,
                  or have it send a proposal or release a payout for you.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Financial products teaser */}
      {teaser && (
        <section className="border-t border-line bg-bg py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <Reveal>
                <LottieIcon src="/lottie/coins.json" className="-ml-3 h-24 w-24" />
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                  {teaser.eyebrow}
                </p>
                <h2 className="font-display mt-3 text-4xl text-ink sm:text-5xl">{teaser.title}</h2>
                <p className="mt-5 max-w-lg leading-relaxed text-ink/70">{teaser.body}</p>

                <ul className="mt-7 space-y-3">
                  {teaser.bullets.map((bullet, i) => {
                    const Icon = TEASER_ICONS[i % TEASER_ICONS.length];
                    return (
                      <li key={bullet} className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-medium text-ink">{bullet}</span>
                      </li>
                    );
                  })}
                </ul>

                <Link
                  href={teaser.cta_href}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-grad-brand px-7 py-3.5 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
                >
                  {teaser.cta_label}
                </Link>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-paper shadow-xl">
                  <div className="flex items-center justify-between bg-bg px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-ink/15" />
                      <span className="h-2 w-2 rounded-full bg-ink/15" />
                      <span className="h-2 w-2 rounded-full bg-ink/15" />
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">
                      Nyx Advance
                    </p>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green/10 text-green">
                        <Lock className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">
                          Advance Request
                        </p>
                        <p className="text-[11px] text-ink/40">Product Photography — Standard</p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-xl border border-line px-4 py-3">
                      <div>
                        <p className="text-xs text-ink/45">Requested</p>
                        <p className="font-display mt-0.5 text-lg text-ink">Ksh 12,000</p>
                      </div>
                      <span className="rounded-full bg-green/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green">
                        Approved
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-bg px-4 py-3">
                      <Repeat className="h-3.5 w-3.5 shrink-0 text-brand" />
                      <p className="text-[11px] leading-relaxed text-ink/50">
                        Repays automatically when the client approves and escrow releases.
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

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
