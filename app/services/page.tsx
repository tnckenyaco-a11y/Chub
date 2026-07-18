import Link from "next/link";
import { Eye, MapPin, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ListingHero } from "@/components/listing-hero";

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
        "id, title, slug, views, creative:profiles!services_creative_id_fkey(first_name, last_name, city, country), categories(slug, name), service_packages(price_kes), service_images(file_url, sort_order)"
      )
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ]);

  const filtered = category
    ? services?.filter((s) => s.categories?.slug === category)
    : services;

  return (
    <div>
      <ListingHero
        eyebrow="Marketplace"
        title="Services"
        subtitle="Ready-to-book creative gigs from vetted talent."
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
            return (
              <Link
                key={s.id}
                href={`/services/${s.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-sm transition hover:-translate-y-0.5 hover:border-volt hover:shadow-md"
              >
                <div
                  className="h-40 bg-cover bg-center bg-brand/10"
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
                  {s.creative && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-ink/50">
                      {s.creative.first_name} {s.creative.last_name}
                      {s.creative.city && (
                        <span className="ml-1 flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" />
                          {s.creative.city}
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
