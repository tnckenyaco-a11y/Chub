import { getSitePage } from "@/lib/site-pages";
import { ComingSoon } from "@/components/coming-soon";

type LegalContent = {
  effective_date: string;
  intro: string;
  sections: { heading: string; body: string }[];
};

export default async function TermsPage() {
  const page = await getSitePage<LegalContent>("terms");
  if (!page) return <ComingSoon title="Terms of Use" />;
  const { effective_date, intro, sections } = page.content;

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Legal</p>
      <h1 className="font-display mt-2 text-4xl text-ink">{page.title}</h1>
      <p className="mt-3 text-xs text-ink/40">Effective {effective_date}</p>
      <p className="mt-8 whitespace-pre-wrap text-[15px] leading-loose text-ink/70">{intro}</p>

      <div className="mt-6 space-y-10">
        {sections.map((s) => (
          <section key={s.heading} className="border-t border-line pt-8">
            <h2 className="font-display text-xl text-ink">{s.heading}</h2>
            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-loose text-ink/70">
              {s.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
