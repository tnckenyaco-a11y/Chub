"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import type { Database } from "@/lib/supabase/types";

type Role = Database["public"]["Enums"]["user_role"];

export async function setSuspended(userId: string, suspended: boolean) {
  const { supabase } = await requireAdmin();
  await supabase.from("profiles").update({ is_suspended: suspended }).eq("id", userId);
  revalidatePath("/admin/users");
}

export async function setRole(userId: string, role: Role) {
  const { supabase } = await requireAdmin();
  await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin/users");
}
