import { requireProfile } from "@/lib/current-user";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
      <div className="flex items-center justify-between border-b border-line pb-6">
        <div />
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-full bg-paper/10 bg-cover bg-center"
            style={profile.avatar_url ? { backgroundImage: `url(${profile.avatar_url})` } : undefined}
          />
          <div className="text-right">
            <p className="text-sm text-paper">{profile.first_name || profile.username}</p>
            <p className="text-xs capitalize text-paper/50">{profile.role}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-8 py-8">
        <DashboardNav role={profile.role} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
