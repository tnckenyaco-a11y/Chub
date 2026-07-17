"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";

export async function moderateService(id: string, status: "published" | "rejected") {
  const { supabase } = await requireAdmin();
  await supabase.from("services").update({ status }).eq("id", id);
  revalidatePath("/admin/listings");
}

export async function moderateProject(id: string, status: "published" | "rejected") {
  const { supabase } = await requireAdmin();
  await supabase.from("projects").update({ status }).eq("id", id);
  revalidatePath("/admin/listings");
}
