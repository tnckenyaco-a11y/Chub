import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  const [{ data: categories }, { data: services }] = await Promise.all([
    supabase.from("categories").select("id, slug, name").order("sort_order"),
    supabase
      .from("services")
      .select(
        "id, title, slug, views, creative:profiles!services_creative_id_fkey(first_name, last_name, city, country), categories(slug), service_packages(price_kes)"
      )
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ]);

  const filtered = category
    ? services?.filter((s) => s.categories?.slug === category)
    : services;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <h1 className="font-display text-5xl uppercase text-paper">Services</h1>
      <p className="mt-2 text-sm text-paper/60">
        Ready-to-book creative gigs from vetted talent.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/services"
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
            !category ? "border-volt text-volt" : "border-line text-paper/60 hover:border-paper"
          }`}
        >
          All
        </Link>
        {categories?.map((c) => (
          <Link
            key={c.id}
            href={`/services?category=${c.slug}`}
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
        {filtered?.map((s) => {
          const lowestPrice = s.service_packages?.length
            ? Math.min(...s.service_packages.map((p) => p.price_kes))
            : null;
          return (
            <Link
              key={s.id}
              href={`/services/${s.slug}`}
              className="rounded-2xl border border-line p-6 transition hover:border-volt"
            >
              <h2 className="font-semibold text-paper">{s.title}</h2>
              {s.creative && (
                <p className="mt-2 text-xs text-paper/50">
                  {s.creative.first_name} {s.creative.last_name}
                  {s.creative.city ? ` · ${s.creative.city}` : ""}
                </p>
              )}
              {lowestPrice !== null && (
                <p className="mt-4 text-sm text-volt">From Ksh {lowestPrice.toLocaleString()}</p>
              )}
            </Link>
          );
        })}
      </div>

      {!filtered?.length && (
        <p className="mt-16 text-sm text-paper/50">
          No services match yet — check back as creatives get approved.
        </p>
      )}
    </div>
  );
}
