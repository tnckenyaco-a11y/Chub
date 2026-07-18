import Link from "next/link";
import { Clock, Tag, Users, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ListingHero } from "@/components/listing-hero";
import { timeAgo } from "@/lib/format";

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
        "id, title, slug, pricing_type, budget_min, budget_max, created_at, categories(slug, name), proposals(count), project_images(file_url, sort_order)"
      )
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ]);

  const filtered = category
    ? projects?.filter((p) => p.categories?.slug === category)
    : projects;

  return (
    <div>
      <ListingHero
        eyebrow="Open Work"
        title="Projects"
        subtitle="Brand-posted jobs, open for proposals."
      />

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/projects"
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
              !category ? "border-volt text-volt" : "border-line text-ink/60 hover:border-ink"
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
                  : "border-line text-ink/60 hover:border-ink"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered?.map((p) => {
            const cover = [...(p.project_images ?? [])].sort(
              (a, b) => a.sort_order - b.sort_order
            )[0]?.file_url;
            return (
              <Link
                key={p.id}
                href={`/projects/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-sm transition hover:-translate-y-0.5 hover:border-volt hover:shadow-md"
              >
                <div
                  className="h-40 bg-cover bg-center bg-brand/10"
                  style={cover ? { backgroundImage: `url(${cover})` } : undefined}
                />
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between">
                    {p.categories?.name && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
                        <Tag className="h-3 w-3" />
                        {p.categories.name}
                      </span>
                    )}
                    <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-ink/40">
                      <Clock className="h-3 w-3" />
                      {timeAgo(p.created_at)}
                    </p>
                  </div>
                  <h2 className="mt-3 font-semibold text-ink transition group-hover:text-brand">
                    {p.title}
                  </h2>
                  <p className="mt-1 text-xs uppercase tracking-wide text-ink/40">
                    {p.pricing_type === "fixed" ? "Fixed Price" : "Hourly Rate"}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <p className="flex items-center gap-1 text-sm font-semibold text-volt">
                      <Wallet className="h-3.5 w-3.5" />
                      Ksh {p.budget_min.toLocaleString()}–{p.budget_max.toLocaleString()}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-ink/40">
                      <Users className="h-3.5 w-3.5" />
                      {p.proposals?.[0]?.count ?? 0}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {!filtered?.length && (
          <p className="mt-16 text-sm text-ink/50">
            No projects match yet — check back as brands post more work.
          </p>
        )}
      </div>
    </div>
  );
}
