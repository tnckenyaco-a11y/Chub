import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/current-user";
import { initiateServiceCheckout } from "@/app/checkout/actions";

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
        <h1 className="font-display mt-2 text-4xl uppercase text-ink sm:text-5xl">
          {service.title}
        </h1>
        {service.creative && (
          <Link
            href={`/creatives/${service.creative.username}`}
            className="mt-4 inline-block text-sm text-ink/60 hover:text-volt"
          >
            by {service.creative.first_name} {service.creative.last_name}
            {service.creative.city ? ` · ${service.creative.city}` : ""}
          </Link>
        )}
        <p className="mt-8 whitespace-pre-wrap leading-relaxed text-ink/70">
          {service.description}
        </p>
      </div>

      <div className="space-y-4">
        {packages?.map((p) => {
          const checkout = initiateServiceCheckout.bind(null, p.id);
          return (
            <div key={p.id} className="rounded-2xl border border-line p-6">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink">{p.title}</p>
                <p className="font-display text-2xl text-volt">
                  Ksh {p.price_kes.toLocaleString()}
                </p>
              </div>
              {p.description && <p className="mt-2 text-sm text-ink/60">{p.description}</p>}
              <p className="mt-3 text-xs text-ink/40">
                {p.delivery_days} day delivery · {p.revisions} revision
                {p.revisions === 1 ? "" : "s"}
              </p>

              {viewer?.role === "brand" ? (
                <form action={checkout} className="mt-4 space-y-2">
                  <input
                    name="phone_number"
                    required
                    placeholder="M-Pesa phone (07XXXXXXXX)"
                    className="w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm text-ink outline-none focus:border-volt"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-full bg-volt px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-ink"
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
