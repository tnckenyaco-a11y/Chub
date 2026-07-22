import Link from "next/link";
import { forbidden } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { withdrawProposal } from "@/app/proposals/actions";
import { respondToSquadInvite } from "@/app/squad-invites/actions";

const statusStyle: Record<string, string> = {
  pending: "bg-ink/8 text-ink/55",
  invited: "bg-ink/8 text-ink/55",
  accepted: "bg-green/10 text-green",
  rejected: "bg-magenta/10 text-magenta",
  declined: "bg-magenta/10 text-magenta",
  withdrawn: "bg-ink/5 text-ink/35",
};

export default async function MyProposalsPage() {
  const profile = await requireProfile();
  if (profile.role !== "creative") forbidden();

  const supabase = await createClient();
  const [{ data: proposals }, { data: squadInvites }] = await Promise.all([
    supabase
      .from("proposals")
      .select("id, rate, status, created_at, project:projects(title, slug)")
      .eq("creative_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("project_squad_invites")
      .select("id, role, rate_kes, status, created_at, project:projects(title, slug)")
      .eq("creative_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Squad Invites</h1>

      <ul className="mt-8 space-y-2">
        {squadInvites?.map((s) => {
          const accept = respondToSquadInvite.bind(null, s.id, "accepted");
          const decline = respondToSquadInvite.bind(null, s.id, "declined");
          return (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-line bg-paper px-5 py-3.5"
            >
              <div>
                {s.project && (
                  <Link href={`/projects/${s.project.slug}`} className="font-medium text-ink hover:text-brand">
                    {s.project.title}
                  </Link>
                )}
                <p className="mt-0.5 text-xs text-ink/40">
                  {s.role} · Ksh {s.rate_kes.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                    statusStyle[s.status] ?? "bg-ink/5 text-ink/50"
                  }`}
                >
                  {s.status}
                </span>
                {s.status === "invited" && (
                  <div className="flex gap-3">
                    <form action={accept}>
                      <button
                        type="submit"
                        className="rounded-full bg-grad-brand px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
                      >
                        Accept
                      </button>
                    </form>
                    <form action={decline}>
                      <button
                        type="submit"
                        className="text-xs uppercase tracking-wide text-ink/40 hover:text-magenta"
                      >
                        Decline
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </li>
          );
        })}
        {!squadInvites?.length && (
          <p className="text-sm text-ink/40">No squad invites yet.</p>
        )}
      </ul>

      <h1 className="font-display mt-14 text-3xl text-ink">My Proposals</h1>

      <ul className="mt-8 space-y-2">
        {proposals?.map((p) => {
          const withdraw = withdrawProposal.bind(null, p.id);
          return (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-line bg-paper px-5 py-3.5"
            >
              <div>
                {p.project && (
                  <Link href={`/projects/${p.project.slug}`} className="font-medium text-ink hover:text-brand">
                    {p.project.title}
                  </Link>
                )}
                <p className="mt-0.5 text-xs text-ink/40">Ksh {p.rate.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                    statusStyle[p.status] ?? "bg-ink/5 text-ink/50"
                  }`}
                >
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
