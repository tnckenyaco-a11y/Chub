import { createClient } from "@/lib/supabase/server";
import { setRole, setSuspended } from "@/app/admin/users/actions";

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

  let query = supabase
    .from("profiles")
    .select("id, first_name, last_name, username, role, country, city, is_suspended, created_at")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,username.ilike.%${q}%`
    );
  }

  const { data: users } = await query;

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Users</h1>

      <form className="mt-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or username…"
          className="w-full max-w-sm rounded-lg border border-line bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
        />
      </form>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-paper shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink/40">
              <th className="py-3 pl-5 pr-4">Name</th>
              <th className="py-3 pr-4">Username</th>
              <th className="py-3 pr-4">Location</th>
              <th className="py-3 pr-4">Role</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-b border-line/60 last:border-0">
                <td className="py-3 pl-5 pr-4 font-medium text-ink">
                  {u.first_name} {u.last_name}
                </td>
                <td className="py-3 pr-4 text-ink/60">@{u.username}</td>
                <td className="py-3 pr-4 text-ink/60">
                  {[u.city, u.country].filter(Boolean).join(", ") || "—"}
                </td>
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
                    <button
                      type="submit"
                      className="rounded-md border border-line px-2 py-1 text-xs uppercase text-ink/70 hover:border-brand hover:text-brand"
                    >
                      Save
                    </button>
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
                  <form
                    action={async () => {
                      "use server";
                      await setSuspended(u.id, !u.is_suspended);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-md border border-line px-3 py-1.5 text-xs uppercase text-ink/70 hover:border-ink hover:text-ink"
                    >
                      {u.is_suspended ? "Unsuspend" : "Suspend"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users?.length && <p className="px-5 py-8 text-sm text-ink/50">No users found.</p>}
      </div>
    </div>
  );
}
