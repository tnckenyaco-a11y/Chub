import { requireAdmin } from "@/lib/require-admin";
import { createServiceClient } from "@/lib/supabase/service";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const { supabase } = await requireAdmin();

  const [{ data: users }, { data: authUsers }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, first_name, last_name, username, role, country, city, phone, company_name, is_suspended, created_at"
      )
      .order("created_at", { ascending: false }),
    createServiceClient().auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const emailById = new Map((authUsers?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  const rows = (users ?? []).map((u) => ({
    id: u.id,
    first_name: u.first_name,
    last_name: u.last_name,
    username: u.username,
    email: emailById.get(u.id) ?? "",
    role: u.role,
    phone: u.phone ?? "",
    company_name: u.company_name ?? "",
    city: u.city ?? "",
    country: u.country ?? "",
    is_suspended: u.is_suspended ? "suspended" : "active",
    created_at: u.created_at,
  }));

  const csv = toCsv(rows, [
    { key: "id", label: "ID" },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "phone", label: "Phone" },
    { key: "company_name", label: "Company" },
    { key: "city", label: "City" },
    { key: "country", label: "Country" },
    { key: "is_suspended", label: "Status" },
    { key: "created_at", label: "Joined" },
  ]);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="users-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
