import { requireProfile } from "@/lib/current-user";
import { signOut } from "@/app/(auth)/actions";

export default async function DashboardPage() {
  const profile = await requireProfile();

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-volt">
        {profile.role}
      </p>
      <h1 className="font-display mt-4 text-4xl uppercase text-paper">
        Welcome, {profile.first_name || profile.username}
      </h1>
      <p className="mt-4 max-w-lg text-sm text-paper/60">
        {profile.role === "creative"
          ? "Manage your services, track proposals, and see your orders here."
          : profile.role === "brand"
            ? "Post projects, review proposals, and track your orders here."
            : "Head to the admin console to manage the platform."}
      </p>
      <form action={signOut} className="mt-10">
        <button
          type="submit"
          className="rounded-full border border-line px-6 py-3 text-sm font-semibold uppercase tracking-wide text-paper transition hover:border-paper"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}
