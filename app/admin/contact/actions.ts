"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markContactMessageRead(id: string, isRead: boolean) {
  const supabase = await createClient();
  await supabase.from("contact_messages").update({ is_read: isRead }).eq("id", id);
  revalidatePath("/admin/contact");
}
