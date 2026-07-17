import Link from "next/link";
import { forbidden } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

const statusColor: Record<string, string> = {
  published: "text-volt",
  pending_review: "text-paper/50",
  rejected: "text-magenta",
  archived: "text-paper/30",
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
        <h1 className="font-display text-4xl uppercase text-paper">My Projects</h1>
        <Link
          href="/projects/new"
          className="rounded-full bg-volt px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink"
        >
          Post a Project
        </Link>
      </div>

      <ul className="mt-8 space-y-2">
        {projects?.map((p) => (
          <li key={p.id}>
            <Link
              href={`/dashboard/projects/${p.id}`}
              className="flex items-center justify-between rounded-lg border border-line px-4 py-3 transition hover:border-volt"
            >
              <span className="text-paper">{p.title}</span>
              <span className="flex items-center gap-4">
                <span className="text-xs text-paper/40">
                  {p.proposals?.[0]?.count ?? 0} proposal
                  {(p.proposals?.[0]?.count ?? 0) === 1 ? "" : "s"}
                </span>
                <span className={`text-xs uppercase ${statusColor[p.status] ?? "text-paper/50"}`}>
                  {p.status.replace("_", " ")}
                </span>
              </span>
            </Link>
          </li>
        ))}
        {!projects?.length && (
          <p className="text-sm text-paper/40">No projects yet — post one to get proposals.</p>
        )}
      </ul>
    </div>
  );
}
