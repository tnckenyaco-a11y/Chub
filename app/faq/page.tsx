import { getSitePage } from "@/lib/site-pages";
import { ComingSoon } from "@/components/coming-soon";

export default async function FaqPage() {
  const page = await getSitePage<{ items: { question: string; answer: string }[] }>("faq");
  const items = page?.content.items ?? [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-volt">Support</p>
      <h1 className="font-display mt-2 text-4xl text-ink">
        Frequently asked <span className="font-accent">questions</span>
      </h1>
      {items.length === 0 ? (
        <ComingSoon title="" note="FAQs are being written — check back soon." />
      ) : (
        <div className="mt-10 divide-y divide-line">
          {items.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-ink marker:content-none">
                {item.question}
                <span className="shrink-0 text-lg leading-none text-brand transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">{item.answer}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
