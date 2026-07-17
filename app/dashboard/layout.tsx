import { requireProfile } from "@/lib/current-user";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();

  return (
    <div className="mx-auto flex max-w-7xl gap-10 px-6 py-12 lg:px-10">
      <DashboardNav role={profile.role} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
