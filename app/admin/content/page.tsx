import Link from "next/link";
import { FileEdit } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminContentPage() {
  const supabase = await createClient();
  const { data: pages } = await supabase
    .from("site_pages")
    .select("slug, title, updated_at")
    .order("slug");

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Content (CMS)</h1>
      <p className="mt-2 text-sm text-ink/50">
        These pages drive the public site — no more hardcoded copy or dead links.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pages?.map((p) => (
          <Link
            key={p.slug}
            href={`/admin/content/${p.slug}`}
            className="rounded-2xl border border-line bg-paper p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <FileEdit className="h-4 w-4" />
            </div>
            <p className="mt-3 font-semibold text-ink">{p.title}</p>
            <p className="mt-1 text-xs text-ink/40">/{p.slug}</p>
          </Link>
        ))}
        {!pages?.length && <p className="text-sm text-ink/40">No pages yet.</p>}
      </div>
    </div>
  );
}
