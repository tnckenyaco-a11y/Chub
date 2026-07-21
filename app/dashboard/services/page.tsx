import Link from "next/link";
import { forbidden } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

const statusStyle: Record<string, string> = {
  published: "bg-green/10 text-green",
  pending_review: "bg-ink/8 text-ink/55",
  rejected: "bg-magenta/10 text-magenta",
  archived: "bg-ink/5 text-ink/35",
};

export default async function MyServicesPage() {
  const profile = await requireProfile();
  if (profile.role !== "creative") forbidden();

  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("id, title, status, views, created_at")
    .eq("creative_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">My Services</h1>
        <Link
          href="/dashboard/services/new"
          className="rounded-full bg-grad-brand px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
        >
          New Service
        </Link>
      </div>

      <ul className="mt-8 space-y-2">
        {services?.map((s) => (
          <li key={s.id}>
            <Link
              href={`/dashboard/services/${s.id}`}
              className="flex items-center justify-between rounded-xl border border-line bg-paper px-5 py-3.5 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-sm"
            >
              <span className="font-medium text-ink">{s.title}</span>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                  statusStyle[s.status] ?? "bg-ink/5 text-ink/50"
                }`}
              >
                {s.status.replace("_", " ")}
              </span>
            </Link>
          </li>
        ))}
        {!services?.length && (
          <p className="text-sm text-ink/40">
            No services yet — post one and it&apos;ll go live once approved.
          </p>
        )}
      </ul>
    </div>
  );
}
