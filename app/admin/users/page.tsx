import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { setRole, setSuspended, sendPasswordReset, deleteUser } from "@/app/admin/users/actions";
import { SubmitButton } from "@/components/submit-button";
import { formatDate } from "@/lib/format";

const roleStyle: Record<string, string> = {
  creative: "bg-brand/10 text-brand",
  brand: "bg-amber-500/10 text-amber-600",
  admin: "bg-ink/8 text-ink/70",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const [{ data: users }, { data: orders }, { data: authUsers }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, first_name, last_name, username, role, country, city, phone, company_name, is_suspended, created_at"
      )
      .order("created_at", { ascending: false }),
    supabase.from("orders").select("brand_id, creative_id"),
    createServiceClient().auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const emailById = new Map((authUsers?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  const orderCountById = new Map<string, number>();
  for (const o of orders ?? []) {
    orderCountById.set(o.brand_id, (orderCountById.get(o.brand_id) ?? 0) + 1);
    orderCountById.set(o.creative_id, (orderCountById.get(o.creative_id) ?? 0) + 1);
  }

  const query = q?.toLowerCase().trim();
  const filteredUsers = (users ?? []).filter((u) => {
    if (!query) return true;
    const email = emailById.get(u.id) ?? "";
    return (
      u.first_name?.toLowerCase().includes(query) ||
      u.last_name?.toLowerCase().includes(query) ||
      u.username?.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-ink">Users</h1>
        <a
          href="/admin/users/export"
          className="rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink/70 transition hover:border-brand hover:text-brand"
        >
          Export CSV
        </a>
      </div>

      <form className="mt-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, username, or email…"
          className="w-full max-w-sm rounded-lg border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
        />
      </form>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-paper shadow-sm">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink/40">
              <th className="py-3 pl-5 pr-4">Name</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Phone</th>
              <th className="py-3 pr-4">Company</th>
              <th className="py-3 pr-4">Orders</th>
              <th className="py-3 pr-4">Joined</th>
              <th className="py-3 pr-4">Role</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => {
              const isSelf = u.id === currentUser?.id;
              return (
                <tr key={u.id} className="border-b border-line/60 last:border-0 align-top">
                  <td className="py-3 pl-5 pr-4 font-medium text-ink">
                    {u.first_name} {u.last_name}
                    <p className="font-normal text-ink/40">@{u.username}</p>
                  </td>
                  <td className="py-3 pr-4 text-ink/60">{emailById.get(u.id) || "—"}</td>
                  <td className="py-3 pr-4 text-ink/60">{u.phone || "—"}</td>
                  <td className="py-3 pr-4 text-ink/60">{u.company_name || "—"}</td>
                  <td className="py-3 pr-4 text-ink/60">{orderCountById.get(u.id) ?? 0}</td>
                  <td className="py-3 pr-4 text-ink/60">{formatDate(u.created_at)}</td>
                  <td className="py-3 pr-4">
                    <form
                      action={async (formData: FormData) => {
                        "use server";
                        const role = formData.get("role") as "creative" | "brand" | "admin";
                        await setRole(u.id, role);
                      }}
                      className="flex items-center gap-2"
                    >
                      <select
                        name="role"
                        defaultValue={u.role}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${roleStyle[u.role] ?? "bg-ink/5 text-ink/60"}`}
                      >
                        <option value="creative">Creative</option>
                        <option value="brand">Brand</option>
                        <option value="admin">Admin</option>
                      </select>
                      <SubmitButton className="rounded-md border border-line px-2 py-1 text-xs uppercase text-ink/70 hover:border-brand hover:text-brand">
                        Save
                      </SubmitButton>
                    </form>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                        u.is_suspended ? "bg-magenta/10 text-magenta" : "bg-green/10 text-green"
                      }`}
                    >
                      {u.is_suspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="py-3 pr-5">
                    <div className="flex flex-col items-start gap-1.5">
                      <form
                        action={async () => {
                          "use server";
                          await setSuspended(u.id, !u.is_suspended);
                        }}
                      >
                        <SubmitButton className="rounded-md border border-line px-3 py-1.5 text-xs uppercase text-ink/70 hover:border-ink hover:text-ink">
                          {u.is_suspended ? "Unsuspend" : "Suspend"}
                        </SubmitButton>
                      </form>
                      <form action={sendPasswordReset.bind(null, u.id)}>
                        <SubmitButton
                          pendingText="Sending…"
                          className="rounded-md border border-line px-3 py-1.5 text-xs uppercase text-ink/70 hover:border-brand hover:text-brand"
                        >
                          Send password reset
                        </SubmitButton>
                      </form>
                      {!isSelf && (
                        <form action={deleteUser.bind(null, u.id)}>
                          <SubmitButton
                            pendingText="Deleting…"
                            confirmMessage={`Permanently delete ${u.first_name} ${u.last_name} (@${u.username})? This also deletes all their orders, payments, reviews, and disputes. This cannot be undone.`}
                            className="rounded-md border border-magenta/40 px-3 py-1.5 text-xs uppercase text-magenta hover:bg-magenta/10"
                          >
                            Delete
                          </SubmitButton>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!filteredUsers.length && <p className="px-5 py-8 text-sm text-ink/50">No users found.</p>}
      </div>
    </div>
  );
}
