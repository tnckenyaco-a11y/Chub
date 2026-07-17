import { redirect, forbidden } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// RLS is the real security boundary (every admin-only table policy checks
// is_admin() independently) — this just gives callers a fast, clear failure
// instead of a silent zero-row mutation.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") forbidden();

  return { supabase, user };
}
