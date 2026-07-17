import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/require-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-6 py-12 lg:px-10">
      <AdminNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
