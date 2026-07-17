import Link from "next/link";
import { forbidden } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { withdrawProposal } from "@/app/proposals/actions";

const statusColor: Record<string, string> = {
  pending: "text-ink/50",
  accepted: "text-volt",
  rejected: "text-magenta",
  withdrawn: "text-ink/30",
};

export default async function MyProposalsPage() {
  const profile = await requireProfile();
  if (profile.role !== "creative") forbidden();

  const supabase = await createClient();
  const { data: proposals } = await supabase
    .from("proposals")
    .select("id, rate, status, created_at, project:projects(title, slug)")
    .eq("creative_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-4xl uppercase text-ink">My Proposals</h1>

      <ul className="mt-8 space-y-2">
        {proposals?.map((p) => {
          const withdraw = withdrawProposal.bind(null, p.id);
          return (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-line px-4 py-3"
            >
              <div>
                {p.project && (
                  <Link href={`/projects/${p.project.slug}`} className="text-ink hover:text-volt">
                    {p.project.title}
                  </Link>
                )}
                <p className="text-xs text-ink/40">Ksh {p.rate.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs uppercase ${statusColor[p.status] ?? "text-ink/50"}`}>
                  {p.status}
                </span>
                {p.status === "pending" && (
                  <form action={withdraw}>
                    <button
                      type="submit"
                      className="text-xs uppercase tracking-wide text-ink/40 hover:text-magenta"
                    >
                      Withdraw
                    </button>
                  </form>
                )}
              </div>
            </li>
          );
        })}
        {!proposals?.length && (
          <p className="text-sm text-ink/40">No proposals sent yet.</p>
        )}
      </ul>
    </div>
  );
}
