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

export default async function MyProjectsPage() {
  const profile = await requireProfile();
  if (profile.role !== "brand") forbidden();

  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, status, created_at, proposals(count)")
    .eq("brand_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">My Projects</h1>
        <Link
          href="/projects/new"
          className="rounded-full bg-grad-brand px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
        >
          Post a Project
        </Link>
      </div>

      <ul className="mt-8 space-y-2">
        {projects?.map((p) => (
          <li key={p.id}>
            <Link
              href={`/dashboard/projects/${p.id}`}
              className="flex items-center justify-between rounded-xl border border-line bg-paper px-5 py-3.5 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-sm"
            >
              <span className="font-medium text-ink">{p.title}</span>
              <span className="flex items-center gap-4">
                <span className="text-xs text-ink/40">
                  {p.proposals?.[0]?.count ?? 0} proposal
                  {(p.proposals?.[0]?.count ?? 0) === 1 ? "" : "s"}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                    statusStyle[p.status] ?? "bg-ink/5 text-ink/50"
                  }`}
                >
                  {p.status.replace("_", " ")}
                </span>
              </span>
            </Link>
          </li>
        ))}
        {!projects?.length && (
          <p className="text-sm text-ink/40">No projects yet — post one to get proposals.</p>
        )}
      </ul>
    </div>
  );
}
