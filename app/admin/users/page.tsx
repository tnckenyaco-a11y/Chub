import { createClient } from "@/lib/supabase/server";
import { setRole, setSuspended } from "@/app/admin/users/actions";

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
      <h1 className="font-display text-4xl uppercase text-paper">Users</h1>

      <form className="mt-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or username…"
          className="w-full max-w-sm rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm text-paper outline-none focus:border-volt"
        />
      </form>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-paper/40">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Username</th>
              <th className="py-3 pr-4">Location</th>
              <th className="py-3 pr-4">Role</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-b border-line/50">
                <td className="py-3 pr-4 text-paper">
                  {u.first_name} {u.last_name}
                </td>
                <td className="py-3 pr-4 text-paper/60">@{u.username}</td>
                <td className="py-3 pr-4 text-paper/60">
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
                      className="rounded-md border border-line bg-transparent px-2 py-1 text-xs uppercase text-paper"
                    >
                      <option value="creative">Creative</option>
                      <option value="brand">Brand</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="submit"
                      className="rounded-md border border-line px-2 py-1 text-xs uppercase text-paper/70 hover:border-volt hover:text-volt"
                    >
                      Save
                    </button>
                  </form>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={
                      u.is_suspended
                        ? "text-magenta"
                        : "text-volt"
                    }
                  >
                    {u.is_suspended ? "Suspended" : "Active"}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <form
                    action={async () => {
                      "use server";
                      await setSuspended(u.id, !u.is_suspended);
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-md border border-line px-3 py-1.5 text-xs uppercase text-paper/70 hover:border-paper hover:text-paper"
                    >
                      {u.is_suspended ? "Unsuspend" : "Suspend"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users?.length && <p className="py-8 text-sm text-paper/50">No users found.</p>}
      </div>
    </div>
  );
}
