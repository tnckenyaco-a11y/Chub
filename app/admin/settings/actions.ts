"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";

export async function updateContactInfo(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const content = {
    intro: String(formData.get("intro") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    location: String(formData.get("location") ?? "").trim() || null,
    support_hours: String(formData.get("support_hours") ?? "").trim() || null,
  };

  await supabase
    .from("site_pages")
    .update({ content, updated_by: user.id })
    .eq("slug", "contact");

  revalidatePath("/admin/settings");
  revalidatePath("/contact");
  redirect("/admin/settings?saved=contact");
}

const SOCIAL_KEYS = ["instagram", "tiktok", "linkedin", "whatsapp", "youtube"] as const;

export async function updateSocialLinks(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const content: Record<string, { url: string; enabled: boolean }> = {};
  for (const key of SOCIAL_KEYS) {
    content[key] = {
      url: String(formData.get(`${key}_url`) ?? "").trim(),
      enabled: formData.get(`${key}_enabled`) === "on",
    };
  }

  await supabase
    .from("site_pages")
    .update({ content, updated_by: user.id })
    .eq("slug", "social_links");

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=social");
}
