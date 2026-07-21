import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, RefreshCw, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/current-user";
import { initiateServiceCheckout } from "@/app/checkout/actions";
import { ImageGallery } from "@/components/image-gallery";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const viewer = await getCurrentProfile();

  const { data: service } = await supabase
    .from("services")
    .select(
      "id, title, description, status, categories(name), creative:profiles!services_creative_id_fkey(username, first_name, last_name, city, country), service_images(file_url, sort_order)"
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

  const images = [...(service.service_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.file_url);

  const featuredIndex = packages && packages.length > 1 ? 1 : 0;

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1.4fr_1fr] lg:px-10">
      <div>
        {images.length > 0 ? (
          <div className="mb-8">
            <ImageGallery images={images} />
          </div>
        ) : (
          <div className="mb-8 aspect-video rounded-2xl bg-grad-brand" />
        )}
        {service.categories && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
            <Tag className="h-3 w-3" />
            {service.categories.name}
          </span>
        )}
        <h1 className="font-display mt-3 text-3xl text-ink sm:text-4xl">{service.title}</h1>
        {service.creative && (
          <Link
            href={`/creatives/${service.creative.username}`}
            className="mt-3 inline-block text-sm text-ink/60 hover:text-brand"
          >
            by <span className="font-semibold">{service.creative.first_name} {service.creative.last_name}</span>
            {service.creative.city ? ` · ${service.creative.city}` : ""}
          </Link>
        )}
        <p className="mt-8 whitespace-pre-wrap leading-relaxed text-ink/70">
          {service.description}
        </p>
      </div>

      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {packages?.map((p, i) => {
          const checkout = initiateServiceCheckout.bind(null, p.id);
          const featured = i === featuredIndex;
          return (
            <div
              key={p.id}
              className={`rounded-2xl border p-6 transition ${
                featured
                  ? "border-brand bg-brand/[0.03] shadow-md ring-1 ring-brand/20"
                  : "border-line"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink">{p.title}</p>
                <p className="font-display text-2xl text-brand">
                  Ksh {p.price_kes.toLocaleString()}
                </p>
              </div>
              {p.description && <p className="mt-2 text-sm text-ink/60">{p.description}</p>}
              <p className="mt-3 flex items-center gap-3 text-xs text-ink/40">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {p.delivery_days} day delivery
                </span>
                <span className="flex items-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5" />
                  {p.revisions} revision{p.revisions === 1 ? "" : "s"}
                </span>
              </p>

              {viewer?.role === "brand" ? (
                <form action={checkout} className="mt-4 space-y-2">
                  <input
                    name="phone_number"
                    required
                    placeholder="M-Pesa phone (07XXXXXXXX)"
                    className="w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-full bg-grad-brand px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
                  >
                    Continue (Ksh {p.price_kes.toLocaleString()})
                  </button>
                </form>
              ) : (
                <p className="mt-4 text-xs text-ink/40">Sign in as a brand to book this.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
