import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminContentPage() {
  const supabase = await createClient();
  const { data: pages } = await supabase
    .from("site_pages")
    .select("slug, title, updated_at")
    .order("slug");

  return (
    <div>
      <h1 className="font-display text-4xl uppercase text-ink">Content (CMS)</h1>
      <p className="mt-2 text-sm text-ink/50">
        These pages drive the public site — no more hardcoded copy or dead links.
      </p>

      <ul className="mt-8 space-y-2">
        {pages?.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/admin/content/${p.slug}`}
              className="flex items-center justify-between rounded-lg border border-line px-4 py-3 transition hover:border-volt"
            >
              <span className="text-ink">{p.title}</span>
              <span className="text-xs text-ink/40">/{p.slug}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
