"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";

export async function markContactMessageRead(id: string, isRead: boolean) {
  const { supabase } = await requireAdmin();
  await supabase.from("contact_messages").update({ is_read: isRead }).eq("id", id);
  revalidatePath("/admin/contact");
}
