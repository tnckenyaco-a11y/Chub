import { getSitePage } from "@/lib/site-pages";
import { ComingSoon } from "@/components/coming-soon";

export default async function PrivacyPolicyPage() {
  const page = await getSitePage<{ body: string }>("privacy-policy");
  if (!page) return <ComingSoon title="Privacy Policy" />;

  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
      <h1 className="font-display text-4xl uppercase text-paper">{page.title}</h1>
      <p className="mt-6 text-paper/70">{page.content.body}</p>
    </div>
  );
}
