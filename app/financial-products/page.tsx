import { Landmark, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import { getSitePage } from "@/lib/site-pages";
import { ComingSoon } from "@/components/coming-soon";

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
  "Rolling Out": "bg-brand/10 text-brand",
  "Coming Later": "bg-ink/8 text-ink/50",
};

export default async function FinancialProductsPage() {
  const page = await getSitePage<FinancialProductsContent>("financial_products");
  if (!page) return <ComingSoon title="Financial Products" />;
  const { hero, spine, products, disclosure } = page.content;

  return (
    <div className="mx-auto max-w-5xl px-6 py-20 lg:px-10">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-volt">
          {hero.eyebrow}
        </p>
        <h1 className="font-display mt-4 text-5xl text-ink sm:text-6xl">{hero.title}</h1>
        <p className="mt-6 max-w-2xl leading-relaxed text-ink/70">{hero.body}</p>
      </section>

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
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-xl text-ink">{product.name}</h3>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    STATUS_STYLE[product.status] ?? "bg-ink/8 text-ink/50"
                  }`}
                >
                  {product.status}
                </span>
              </div>
              <p className="font-accent mt-2 text-lg text-brand">{product.tagline}</p>
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
  );
}
