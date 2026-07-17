import Link from "next/link";
import { forbidden } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

const statusColor: Record<string, string> = {
  published: "text-volt",
  pending_review: "text-ink/50",
  rejected: "text-magenta",
  archived: "text-ink/30",
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
        <h1 className="font-display text-4xl uppercase text-ink">My Services</h1>
        <Link
          href="/dashboard/services/new"
          className="rounded-full bg-volt px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink"
        >
          New Service
        </Link>
      </div>

      <ul className="mt-8 space-y-2">
        {services?.map((s) => (
          <li key={s.id}>
            <Link
              href={`/dashboard/services/${s.id}`}
              className="flex items-center justify-between rounded-lg border border-line px-4 py-3 transition hover:border-volt"
            >
              <span className="text-ink">{s.title}</span>
              <span className={`text-xs uppercase ${statusColor[s.status] ?? "text-ink/50"}`}>
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
