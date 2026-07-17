import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateSitePage } from "@/app/admin/content/actions";

export default async function AdminEditContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { slug } = await params;
  const { saved, error } = await searchParams;
  const supabase = await createClient();
  const { data: page } = await supabase
    .from("site_pages")
    .select("slug, title, content, updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!page) notFound();

  const updateAction = updateSitePage.bind(null, slug);

  return (
    <div>
      <h1 className="font-display text-4xl uppercase text-ink">Edit /{page.slug}</h1>

      {saved && (
        <p className="mt-6 rounded-lg border border-volt/40 bg-volt/10 px-4 py-3 text-sm text-volt">
          Saved.
        </p>
      )}
      {error && (
        <p className="mt-6 rounded-lg border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-magenta">
          {error}
        </p>
      )}

      <form action={updateAction} className="mt-8 max-w-3xl space-y-5">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Title
          </span>
          <input
            name="title"
            defaultValue={page.title}
            className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-volt"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Content (JSON)
          </span>
          <textarea
            name="content"
            defaultValue={JSON.stringify(page.content, null, 2)}
            rows={24}
            spellCheck={false}
            className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-3 font-mono text-xs text-ink outline-none focus:border-volt"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-volt px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink"
        >
          Save
        </button>
      </form>
    </div>
  );
}
