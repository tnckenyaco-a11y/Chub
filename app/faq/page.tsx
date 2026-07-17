import { getSitePage } from "@/lib/site-pages";
import { ComingSoon } from "@/components/coming-soon";

export default async function FaqPage() {
  const page = await getSitePage<{ items: { question: string; answer: string }[] }>("faq");
  const items = page?.content.items ?? [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
      <h1 className="font-display text-4xl uppercase text-ink">FAQ</h1>
      {items.length === 0 ? (
        <ComingSoon title="" note="FAQs are being written — check back soon." />
      ) : (
        <div className="mt-10 space-y-6">
          {items.map((item) => (
            <div key={item.question} className="border-b border-line pb-6">
              <p className="font-semibold text-ink">{item.question}</p>
              <p className="mt-2 text-sm text-ink/60">{item.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
