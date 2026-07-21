"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";
import { getBranding } from "@/lib/branding";
import { isValidHex } from "@/lib/color";
import { uploadPublicMedia } from "@/lib/storage";

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

export async function updateBranding(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const current = await getBranding();
  const colorBrand = String(formData.get("color_brand") ?? current.color_brand);
  const colorVolt = String(formData.get("color_volt") ?? current.color_volt);

  if (!isValidHex(colorBrand) || !isValidHex(colorVolt)) {
    redirect("/admin/settings?error=branding");
  }

  let logoDarkUrl = current.logo_dark_url;
  const logoDarkFile = formData.get("logo_dark") as File | null;
  if (logoDarkFile && logoDarkFile.size > 0) {
    logoDarkUrl = await uploadPublicMedia(supabase, user.id, "branding", logoDarkFile);
  }

  let logoLightUrl = current.logo_light_url;
  const logoLightFile = formData.get("logo_light") as File | null;
  if (logoLightFile && logoLightFile.size > 0) {
    logoLightUrl = await uploadPublicMedia(supabase, user.id, "branding", logoLightFile);
  }

  await supabase
    .from("site_pages")
    .update({
      content: {
        color_brand: colorBrand,
        color_volt: colorVolt,
        logo_dark_url: logoDarkUrl,
        logo_light_url: logoLightUrl,
      },
      updated_by: user.id,
    })
    .eq("slug", "branding");

  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=branding");
}

export async function deleteMediaAsset(path: string) {
  const { supabase } = await requireAdmin();
  await supabase.storage.from("public-media").remove([path]);
  revalidatePath("/admin/settings");
}
