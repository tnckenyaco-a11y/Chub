import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  const [{ data: categories }, { data: projects }] = await Promise.all([
    supabase.from("categories").select("id, slug, name").order("sort_order"),
    supabase
      .from("projects")
      .select(
        "id, title, slug, pricing_type, budget_min, budget_max, created_at, categories(slug), proposals(count)"
      )
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ]);

  const filtered = category
    ? projects?.filter((p) => p.categories?.slug === category)
    : projects;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <h1 className="font-display text-5xl uppercase text-paper">Projects</h1>
      <p className="mt-2 text-sm text-paper/60">Brand-posted jobs, open for proposals.</p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/projects"
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
            !category ? "border-volt text-volt" : "border-line text-paper/60 hover:border-paper"
          }`}
        >
          All
        </Link>
        {categories?.map((c) => (
          <Link
            key={c.id}
            href={`/projects?category=${c.slug}`}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
              category === c.slug
                ? "border-volt text-volt"
                : "border-line text-paper/60 hover:border-paper"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered?.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.slug}`}
            className="rounded-2xl border border-line p-6 transition hover:border-volt"
          >
            <p className="text-xs uppercase tracking-wide text-paper/40">
              {p.pricing_type === "fixed" ? "Fixed Price" : "Hourly Rate"}
            </p>
            <h2 className="mt-2 font-semibold text-paper">{p.title}</h2>
            <p className="mt-3 text-sm text-volt">
              Ksh {p.budget_min.toLocaleString()} – {p.budget_max.toLocaleString()}
            </p>
            <p className="mt-2 text-xs text-paper/40">
              {p.proposals?.[0]?.count ?? 0} sent proposal
              {(p.proposals?.[0]?.count ?? 0) === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
      </div>

      {!filtered?.length && (
        <p className="mt-16 text-sm text-paper/50">
          No projects match yet — check back as brands post more work.
        </p>
      )}
    </div>
  );
}
