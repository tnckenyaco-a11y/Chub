import { createClient } from "@/lib/supabase/server";
import { moderateProject, moderateService } from "@/app/admin/listings/actions";

export default async function AdminListingsPage() {
  const supabase = await createClient();

  const [{ data: services }, { data: projects }] = await Promise.all([
    supabase
      .from("services")
      .select("id, title, description, creative:profiles!services_creative_id_fkey(first_name, last_name)")
      .eq("status", "pending_review")
      .order("created_at"),
    supabase
      .from("projects")
      .select("id, title, description, brand:profiles!projects_brand_id_fkey(first_name, last_name)")
      .eq("status", "pending_review")
      .order("created_at"),
  ]);

  return (
    <div>
      <h1 className="font-display text-4xl uppercase text-ink">Listings Moderation</h1>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
          Services ({services?.length ?? 0})
        </h2>
        <div className="mt-4 space-y-4">
          {services?.map((s) => {
            const approve = moderateService.bind(null, s.id, "published");
            const reject = moderateService.bind(null, s.id, "rejected");
            return (
              <div key={s.id} className="rounded-2xl border border-line p-5">
                <p className="font-semibold text-ink">{s.title}</p>
                {s.creative && (
                  <p className="mt-1 text-xs text-ink/50">
                    by {s.creative.first_name} {s.creative.last_name}
                  </p>
                )}
                <p className="mt-2 line-clamp-2 text-sm text-ink/60">{s.description}</p>
                <div className="mt-4 flex gap-3">
                  <form action={approve}>
                    <button
                      type="submit"
                      className="rounded-full bg-volt px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={reject}>
                    <button
                      type="submit"
                      className="rounded-full border border-magenta/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-magenta"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
          {!services?.length && <p className="text-sm text-ink/40">Nothing pending.</p>}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
          Projects ({projects?.length ?? 0})
        </h2>
        <div className="mt-4 space-y-4">
          {projects?.map((p) => {
            const approve = moderateProject.bind(null, p.id, "published");
            const reject = moderateProject.bind(null, p.id, "rejected");
            return (
              <div key={p.id} className="rounded-2xl border border-line p-5">
                <p className="font-semibold text-ink">{p.title}</p>
                {p.brand && (
                  <p className="mt-1 text-xs text-ink/50">
                    by {p.brand.first_name} {p.brand.last_name}
                  </p>
                )}
                <p className="mt-2 line-clamp-2 text-sm text-ink/60">{p.description}</p>
                <div className="mt-4 flex gap-3">
                  <form action={approve}>
                    <button
                      type="submit"
                      className="rounded-full bg-volt px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink"
                    >
                      Approve
                    </button>
                  </form>
                  <form action={reject}>
                    <button
                      type="submit"
                      className="rounded-full border border-magenta/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-magenta"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
          {!projects?.length && <p className="text-sm text-ink/40">Nothing pending.</p>}
        </div>
      </section>
    </div>
  );
}
