import { createServiceClient } from "@/lib/supabase/service";

// Email lives in auth.users, not public.profiles — same lookup
// app/admin/users/actions.ts's sendPasswordReset already does.
export async function getUserEmail(userId: string): Promise<string | null> {
  const { data } = await createServiceClient().auth.admin.getUserById(userId);
  return data.user?.email ?? null;
}
