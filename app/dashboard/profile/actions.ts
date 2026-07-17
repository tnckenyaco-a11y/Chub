"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { uploadPublicMedia, fileKind } from "@/lib/storage";

export async function updateProfileDetails(formData: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const websiteUrl = String(formData.get("website_url") ?? "").trim();

  const socialLinks = {
    instagram: String(formData.get("social_instagram") ?? "").trim() || undefined,
    twitter: String(formData.get("social_twitter") ?? "").trim() || undefined,
    linkedin: String(formData.get("social_linkedin") ?? "").trim() || undefined,
    tiktok: String(formData.get("social_tiktok") ?? "").trim() || undefined,
    youtube: String(formData.get("social_youtube") ?? "").trim() || undefined,
  };

  await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      city: city || null,
      country: country || null,
      bio: bio || null,
      website_url: websiteUrl || null,
      social_links: socialLinks,
    })
    .eq("id", profile.id);

  revalidatePath("/dashboard/profile");
}

async function uploadAndSave(
  formData: FormData,
  fieldName: "avatar" | "cover",
  column: "avatar_url" | "cover_url"
) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const file = formData.get(fieldName) as File | null;
  if (!file || file.size === 0) return;

  const url = await uploadPublicMedia(supabase, profile.id, fieldName, file);
  const update = column === "avatar_url" ? { avatar_url: url } : { cover_url: url };
  await supabase.from("profiles").update(update).eq("id", profile.id);
  revalidatePath("/dashboard/profile");
}

export async function uploadAvatar(formData: FormData) {
  await uploadAndSave(formData, "avatar", "avatar_url");
}

export async function uploadCover(formData: FormData) {
  await uploadAndSave(formData, "cover", "cover_url");
}

export async function addPortfolioItem(formData: FormData) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;

  const title = String(formData.get("title") ?? "").trim() || null;
  const linkUrl = String(formData.get("link_url") ?? "").trim() || null;

  const url = await uploadPublicMedia(supabase, profile.id, "portfolio", file);

  await supabase.from("portfolio_items").insert({
    profile_id: profile.id,
    file_url: url,
    file_type: fileKind(file.type),
    title,
    link_url: linkUrl,
  });

  revalidatePath("/dashboard/profile");
}

export async function deletePortfolioItem(id: string) {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase.from("portfolio_items").delete().eq("id", id).eq("profile_id", profile.id);
  revalidatePath("/dashboard/profile");
}
