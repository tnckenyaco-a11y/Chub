"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import type { Json } from "@/lib/supabase/types";

export async function updateSitePage(slug: string, formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const rawContent = String(formData.get("content") ?? "{}");

  let content: Json;
  try {
    content = JSON.parse(rawContent);
  } catch {
    redirect(`/admin/content/${slug}?error=${encodeURIComponent("Content must be valid JSON.")}`);
  }

  await supabase
    .from("site_pages")
    .update({ title, content, updated_by: user.id })
    .eq("slug", slug);

  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${slug}`);
  redirect(`/admin/content/${slug}?saved=1`);
}
