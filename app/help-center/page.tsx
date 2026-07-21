import { LifeBuoy } from "lucide-react";
import { getSitePage } from "@/lib/site-pages";
import { ComingSoon } from "@/components/coming-soon";

export default async function HelpCenterPage() {
  const page = await getSitePage<{ body: string }>("help-center");
  if (!page) return <ComingSoon title="Help Center" />;

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-grad-brand text-paper">
        <LifeBuoy className="h-5 w-5" />
      </div>
      <h1 className="font-display mt-5 text-4xl text-ink">{page.title}</h1>
      <p className="mt-8 whitespace-pre-wrap text-[15px] leading-loose text-ink/70">
        {page.content.body}
      </p>
    </div>
  );
}
