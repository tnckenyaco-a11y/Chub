import Link from "next/link";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ListingHero } from "@/components/listing-hero";

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
    .select("id, first_name, last_name, username, bio, city, country, avatar_url")
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
    <div>
      <ListingHero
        eyebrow="Talent Directory"
        title="Creatives"
        subtitle="Vetted African creative talent, ready to hire."
      />

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/creatives"
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
              !category ? "border-volt text-volt" : "border-line text-ink/60 hover:border-ink"
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
                  : "border-line text-ink/60 hover:border-ink"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {creatives?.map((c) => {
            const initials = `${c.first_name?.[0] ?? ""}${c.last_name?.[0] ?? ""}`.toUpperCase();
            return (
              <Link
                key={c.id}
                href={`/creatives/${c.username}`}
                className="group rounded-2xl border border-line bg-paper p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-volt hover:shadow-md"
              >
                {c.avatar_url ? (
                  <div
                    className="h-14 w-14 rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${c.avatar_url})` }}
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand font-display text-lg text-paper">
                    {initials || "?"}
                  </div>
                )}
                <h2 className="mt-4 font-semibold text-ink transition group-hover:text-brand">
                  {c.first_name} {c.last_name}
                </h2>
                <p className="text-xs text-ink/40">@{c.username}</p>
                {(c.city || c.country) && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-ink/50">
                    <MapPin className="h-3.5 w-3.5" />
                    {[c.city, c.country].filter(Boolean).join(", ")}
                  </p>
                )}
                {c.bio && <p className="mt-3 line-clamp-2 text-sm text-ink/60">{c.bio}</p>}
              </Link>
            );
          })}
        </div>

        {!creatives?.length && (
          <p className="mt-16 text-sm text-ink/50">
            No creatives match yet — the directory fills in as people join.
          </p>
        )}
      </div>
    </div>
  );
}
