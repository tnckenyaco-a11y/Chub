import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Wrapped in React's request-scoped cache so the layout and page can both
// call this without triggering two round trips per request.
export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, first_name, last_name, username")
    .eq("id", user.id)
    .single();

  return profile;
});

export async function requireProfile() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in");
  return profile;
}
