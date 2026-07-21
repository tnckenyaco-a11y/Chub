import { createClient } from "@/lib/supabase/server";

export type BrandingContent = {
  color_brand: string;
  color_volt: string;
  logo_dark_url: string | null;
  logo_light_url: string | null;
};

export const DEFAULT_BRANDING: BrandingContent = {
  color_brand: "#851490",
  color_volt: "#ff7b10",
  logo_dark_url: null,
  logo_light_url: null,
};

export async function getBranding(): Promise<BrandingContent> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_pages")
    .select("content")
    .eq("slug", "branding")
    .maybeSingle();

  return { ...DEFAULT_BRANDING, ...(data?.content as Partial<BrandingContent> | undefined) };
}
