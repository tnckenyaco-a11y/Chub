import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CreativesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; country?: string; city?: string }>;
}) {
  const { category, country, city } = await searchParams;
  const supabase = await createClient();

  const [{ data: categories }, { data: services }] = await Promise.all([
    supabase.from("categories").select("id, slug, name").order("sort_order"),
    category
      ? supabase
          .from("services")
          .select("creative_id, categories!inner(slug)")
          .eq("status", "published")
          .eq("categories.slug", category)
      : Promise.resolve({ data: null as { creative_id: string }[] | null }),
  ]);

  let query = supabase
    .from("public_profiles")
    .select("id, first_name, last_name, username, bio, city, country")
    .eq("role", "creative")
    .order("created_at", { ascending: false });

  if (country) query = query.eq("country", country);
  if (city) query = query.eq("city", city);
  if (category) {
    const ids = (services ?? []).map((s) => s.creative_id);
    query = query.in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  }

  const { data: creatives } = await query;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <h1 className="font-display text-5xl uppercase text-paper">Creatives</h1>
      <p className="mt-2 text-sm text-paper/60">
        Vetted African creative talent, ready to hire.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/creatives"
          className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
            !category ? "border-volt text-volt" : "border-line text-paper/60 hover:border-paper"
          }`}
        >
          All
        </Link>
        {categories?.map((c) => (
          <Link
            key={c.id}
            href={`/creatives?category=${c.slug}`}
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
        {creatives?.map((c) => (
          <Link
            key={c.id}
            href={`/creatives/${c.username}`}
            className="rounded-2xl border border-line p-6 transition hover:border-volt"
          >
            <div className="h-12 w-12 rounded-full bg-paper/10" />
            <h2 className="mt-4 font-semibold text-paper">
              {c.first_name} {c.last_name}
            </h2>
            <p className="text-xs text-paper/40">@{c.username}</p>
            {(c.city || c.country) && (
              <p className="mt-1 text-xs text-paper/50">
                {[c.city, c.country].filter(Boolean).join(", ")}
              </p>
            )}
            {c.bio && <p className="mt-3 line-clamp-2 text-sm text-paper/60">{c.bio}</p>}
          </Link>
        ))}
      </div>

      {!creatives?.length && (
        <p className="mt-16 text-sm text-paper/50">
          No creatives match yet — the directory fills in as people join.
        </p>
      )}
    </div>
  );
}
