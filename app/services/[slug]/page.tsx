import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: service } = await supabase
    .from("services")
    .select(
      "id, title, description, status, categories(name), creative:profiles!services_creative_id_fkey(username, first_name, last_name, city, country)"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!service) notFound();

  const { data: packages } = await supabase
    .from("service_packages")
    .select("id, title, description, price_kes, delivery_days, revisions")
    .eq("service_id", service.id)
    .order("sort_order");

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.4fr_1fr] lg:px-10">
      <div>
        {service.categories && (
          <p className="text-xs font-semibold uppercase tracking-wide text-volt">
            {service.categories.name}
          </p>
        )}
        <h1 className="font-display mt-2 text-4xl uppercase text-paper sm:text-5xl">
          {service.title}
        </h1>
        {service.creative && (
          <Link
            href={`/creatives/${service.creative.username}`}
            className="mt-4 inline-block text-sm text-paper/60 hover:text-volt"
          >
            by {service.creative.first_name} {service.creative.last_name}
            {service.creative.city ? ` · ${service.creative.city}` : ""}
          </Link>
        )}
        <p className="mt-8 whitespace-pre-wrap leading-relaxed text-paper/70">
          {service.description}
        </p>
      </div>

      <div className="space-y-4">
        {packages?.map((p) => (
          <div key={p.id} className="rounded-2xl border border-line p-6">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-paper">{p.title}</p>
              <p className="font-display text-2xl text-volt">
                Ksh {p.price_kes.toLocaleString()}
              </p>
            </div>
            {p.description && <p className="mt-2 text-sm text-paper/60">{p.description}</p>}
            <p className="mt-3 text-xs text-paper/40">
              {p.delivery_days} day delivery · {p.revisions} revision
              {p.revisions === 1 ? "" : "s"}
            </p>
            <button
              disabled
              title="Checkout launches with the payment integration"
              className="mt-4 w-full cursor-not-allowed rounded-full border border-line px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-paper/40"
            >
              Continue (Ksh {p.price_kes.toLocaleString()})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
