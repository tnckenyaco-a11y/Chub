import { getSitePage } from "@/lib/site-pages";
import { ComingSoon } from "@/components/coming-soon";

export default async function PrivacyPolicyPage() {
  const page = await getSitePage<{ body: string }>("privacy-policy");
  if (!page) return <ComingSoon title="Privacy Policy" />;

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Legal</p>
      <h1 className="font-display mt-2 text-4xl text-ink">{page.title}</h1>
      <p className="mt-8 whitespace-pre-wrap text-[15px] leading-loose text-ink/70">
        {page.content.body}
      </p>
    </div>
  );
}
