import Link from "next/link";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ListingHero } from "@/components/listing-hero";

export default async function CreativesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; country?: string; city?: string; q?: string }>;
}) {
  const { category, country, city, q } = await searchParams;
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

  const { data: allCreatives } = await query;

  const needle = q?.trim().toLowerCase();
  const creatives = needle
    ? allCreatives?.filter((c) =>
        [c.first_name, c.last_name, c.username, c.bio, c.city, c.country]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle)
      )
    : allCreatives;

  return (
    <div>
      <ListingHero
        eyebrow="Talent Directory"
        title="Creatives"
        subtitle="Vetted African creative talent, ready to hire."
        searchAction="/creatives"
        searchParamName="q"
        searchDefaultValue={q}
        searchPlaceholder="Search creatives by name, skill, or city..."
        preserveParams={{ category, country, city }}
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
                className="group overflow-hidden rounded-2xl border border-line bg-paper shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-24 bg-grad-brand">
                  {c.avatar_url ? (
                    <div
                      className="absolute -bottom-7 left-6 h-16 w-16 rounded-full border-4 border-paper bg-cover bg-center shadow-sm"
                      style={{ backgroundImage: `url(${c.avatar_url})` }}
                    />
                  ) : (
                    <div className="absolute -bottom-7 left-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-paper bg-grad-volt font-display text-lg text-ink shadow-sm">
                      {initials || "?"}
                    </div>
                  )}
                </div>
                <div className="p-6 pt-10">
                  <h2 className="font-semibold text-ink transition group-hover:text-brand">
                    {c.first_name} {c.last_name}
                  </h2>
                  <p className="text-xs text-ink/40">@{c.username}</p>
                  {(c.city || c.country) && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-ink/50">
                      <MapPin className="h-3.5 w-3.5" />
                      {[c.city, c.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {c.bio && <p className="mt-3 line-clamp-2 text-sm text-ink/60">{c.bio}</p>}
                </div>
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
