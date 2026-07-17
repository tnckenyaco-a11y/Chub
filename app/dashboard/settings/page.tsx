import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-4xl uppercase text-ink">Settings</h1>

      <div className="mt-8 space-y-4">
        <div className="rounded-2xl border border-line p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Email</p>
          <p className="mt-1 text-ink">{user?.email}</p>
        </div>
        <div className="rounded-2xl border border-line p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Username</p>
          <p className="mt-1 text-ink">@{profile.username}</p>
        </div>
        <div className="rounded-2xl border border-line p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Role</p>
          <p className="mt-1 capitalize text-ink">{profile.role}</p>
        </div>
        <a
          href="/sign-in"
          className="inline-block text-sm text-volt hover:underline"
        >
          Reset your password →
        </a>
      </div>
    </div>
  );
}
