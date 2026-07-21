import Link from "next/link";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";

export default async function MessagesInboxPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, user_one_id, user_two_id, last_message_at")
    .or(`user_one_id.eq.${profile.id},user_two_id.eq.${profile.id}`)
    .order("last_message_at", { ascending: false });

  const otherIds = (conversations ?? []).map((c) =>
    c.user_one_id === profile.id ? c.user_two_id : c.user_one_id
  );

  const { data: others } = otherIds.length
    ? await supabase
        .from("public_profiles")
        .select("id, first_name, last_name, username")
        .in("id", otherIds)
    : { data: [] };

  const othersById = new Map((others ?? []).map((o) => [o.id, o]));

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Messages</h1>

      <ul className="mt-8 space-y-2">
        {conversations?.map((c) => {
          const otherId = c.user_one_id === profile.id ? c.user_two_id : c.user_one_id;
          const other = othersById.get(otherId);
          const initials = other
            ? `${other.first_name?.[0] ?? ""}${other.last_name?.[0] ?? ""}`.toUpperCase()
            : "?";
          return (
            <li key={c.id}>
              <Link
                href={`/dashboard/messages/${c.id}`}
                className="flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-grad-brand text-xs font-bold text-paper">
                  {initials}
                </span>
                <span className="flex-1 font-medium text-ink">
                  {other ? `${other.first_name} ${other.last_name}` : "Unknown user"}
                </span>
                <span className="text-xs text-ink/40">
                  {new Date(c.last_message_at).toLocaleDateString()}
                </span>
              </Link>
            </li>
          );
        })}
        {!conversations?.length && (
          <p className="text-sm text-ink/40">No conversations yet.</p>
        )}
      </ul>
    </div>
  );
}
