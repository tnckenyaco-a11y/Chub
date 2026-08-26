import type { Metadata } from "next";
import { LifeBuoy } from "lucide-react";
import { getSitePage } from "@/lib/site-pages";
import { ComingSoon } from "@/components/coming-soon";

type HelpContent = {
  intro: string;
  sections: { heading: string; body: string }[];
};

export const metadata: Metadata = {
  title: "Help Center",
  openGraph: { title: "Help Center" },
};

export default async function HelpCenterPage() {
  const page = await getSitePage<HelpContent>("help-center");
  if (!page) return <ComingSoon title="Help Center" />;
  const { intro, sections } = page.content;

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-grad-brand text-paper">
        <LifeBuoy className="h-5 w-5" />
      </div>
      <h1 className="font-display mt-5 text-4xl text-ink">{page.title}</h1>
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
