import Link from "next/link";
import { Eye, MapPin, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ListingHero } from "@/components/listing-hero";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const supabase = await createClient();

  const [{ data: categories }, { data: services }] = await Promise.all([
    supabase.from("categories").select("id, slug, name").order("sort_order"),
    supabase
      .from("services")
      .select(
        "id, title, slug, views, creative_id, categories(slug, name), service_packages(price_kes), service_images(file_url, sort_order)"
      )
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ]);

  // creative:profiles!fkey would hit RLS ("owner or admin only") for anyone
  // else viewing the listing, so creative names come from public_profiles instead.
  const { data: creatives } = services?.length
    ? await supabase
        .from("public_profiles")
        .select("id, first_name, last_name, city, country")
        .in("id", services.map((s) => s.creative_id))
    : { data: [] };
  const creativeById = new Map((creatives ?? []).map((c) => [c.id, c]));

  let filtered = category
    ? services?.filter((s) => s.categories?.slug === category)
    : services;

  const needle = q?.trim().toLowerCase();
  if (needle) {
    filtered = filtered?.filter((s) => {
      const creative = creativeById.get(s.creative_id);
      return [s.title, s.categories?.name, creative?.first_name, creative?.last_name, creative?.city]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }

  return (
    <div>
      <ListingHero
        eyebrow="Marketplace"
        title="Services"
        subtitle="Ready-to-book creative gigs from vetted talent."
        searchAction="/services"
        searchParamName="q"
        searchDefaultValue={q}
        searchPlaceholder="Search services by title, category, or creative..."
        preserveParams={{ category }}
      />

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/services"
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
              !category ? "border-volt text-volt" : "border-line text-ink/60 hover:border-ink"
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
                  : "border-line text-ink/60 hover:border-ink"
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
            const cover = [...(s.service_images ?? [])].sort(
              (a, b) => a.sort_order - b.sort_order
            )[0]?.file_url;
            const creative = creativeById.get(s.creative_id);
            return (
              <Link
                key={s.id}
                href={`/services/${s.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className="h-40 bg-cover bg-center bg-grad-brand"
                  style={cover ? { backgroundImage: `url(${cover})` } : undefined}
                />
                <div className="flex flex-1 flex-col p-6">
                  {s.categories?.name && (
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
                      <Tag className="h-3 w-3" />
                      {s.categories.name}
                    </span>
                  )}
                  <h2 className="mt-3 font-semibold text-ink transition group-hover:text-brand">
                    {s.title}
                  </h2>
                  {creative && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-ink/50">
                      {creative.first_name} {creative.last_name}
                      {creative.city && (
                        <span className="ml-1 flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" />
                          {creative.city}
                        </span>
                      )}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    {lowestPrice !== null && (
                      <p className="text-sm font-semibold text-volt">
                        From Ksh {lowestPrice.toLocaleString()}
                      </p>
                    )}
                    <p className="flex items-center gap-1 text-xs text-ink/40">
                      <Eye className="h-3.5 w-3.5" />
                      {s.views ?? 0}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {!filtered?.length && (
          <p className="mt-16 text-sm text-ink/50">
            No services match yet — check back as creatives get approved.
          </p>
        )}
      </div>
    </div>
  );
}
