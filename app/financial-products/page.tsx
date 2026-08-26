import Image from "next/image";
import type { Metadata } from "next";
import { Landmark, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import { getSitePage } from "@/lib/site-pages";
import { ComingSoon } from "@/components/coming-soon";
import { LottieIcon } from "@/components/motion/lottie-icon";

export const metadata: Metadata = {
  title: "Financial Products",
  description:
    "Nyx Advance, Nyx Gear, and Nyx Capital — financial products built around how African creatives actually earn.",
  openGraph: {
    title: "Financial Products",
    description:
      "Nyx Advance, Nyx Gear, and Nyx Capital — financial products built around how African creatives actually earn.",
  },
};

type FinancialProductsContent = {
  hero: { eyebrow: string; title: string; body: string };
  spine: { eyebrow: string; title: string; steps: { title: string; body: string }[] };
  products: {
    name: string;
    status: string;
    tagline: string;
    body: string;
    secured_by: string;
    repayment: string;
  }[];
  disclosure: { title: string; body: string };
};

const SPINE_ICONS = [ShieldCheck, Landmark, Smartphone, Wallet];

const STATUS_STYLE: Record<string, string> = {
  "Applications Opening Soon": "bg-brand/10 text-brand",
  "Coming Later": "bg-ink/8 text-ink/50",
};

const PRODUCT_LOTTIE: Record<string, string> = {
  "Nyx Advance": "/lottie/coins.json",
  "Nyx Gear": "/lottie/camera.json",
  "Nyx Capital": "/lottie/growth.json",
};

export default async function FinancialProductsPage() {
  const page = await getSitePage<FinancialProductsContent>("financial_products");
  if (!page) return <ComingSoon title="Financial Products" />;
  const { hero, spine, products, disclosure } = page.content;

  return (
    <div>
      <section className="relative overflow-hidden bg-ink">
        <Image
          src="/hero/celebrating-creative.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/80 to-ink/50" />
        <div className="relative mx-auto max-w-5xl px-6 py-28 lg:px-10 lg:py-36">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-volt">
            {hero.eyebrow}
          </p>
          <h1 className="font-display mt-4 text-5xl text-paper sm:text-6xl">{hero.title}</h1>
          <p className="mt-6 max-w-2xl leading-relaxed text-paper/80">{hero.body}</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 pb-20 lg:px-10">
        <section className="mt-20 border-t border-line pt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
            {spine.eyebrow}
          </p>
          <h2 className="font-display mt-4 text-4xl text-ink">{spine.title}</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {spine.steps.map((step, i) => {
              const Icon = SPINE_ICONS[i % SPINE_ICONS.length];
              return (
                <div key={step.title}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/8 text-brand">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="mt-3.5 font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{step.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-20 border-t border-line pt-16">
          <h2 className="font-display text-4xl text-ink">The products</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.name}
                className="flex flex-col rounded-2xl border border-line bg-paper p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <LottieIcon src={PRODUCT_LOTTIE[product.name] ?? "/lottie/coins.json"} className="h-14 w-14" />
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      STATUS_STYLE[product.status] ?? "bg-ink/8 text-ink/50"
                    }`}
                  >
                    {product.status}
                  </span>
                </div>
                <h3 className="font-display mt-2 text-xl text-ink">{product.name}</h3>
                <p className="font-accent mt-1 text-lg text-brand">{product.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{product.body}</p>

                <div className="mt-5 space-y-3 border-t border-line pt-5 text-xs">
                  <div>
                    <p className="font-semibold uppercase tracking-wide text-ink/40">Secured by</p>
                    <p className="mt-1 leading-relaxed text-ink/60">{product.secured_by}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wide text-ink/40">Repayment</p>
                    <p className="mt-1 leading-relaxed text-ink/60">{product.repayment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 border-t border-line pt-16 pb-4">
          <div className="rounded-2xl border border-line bg-bg p-8">
            <h2 className="font-display text-2xl text-ink">{disclosure.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink/70">{disclosure.body}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
