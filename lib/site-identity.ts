import { createClient } from "@/lib/supabase/server";

export type SiteIdentityContent = {
  site_name: string;
  tagline: string;
  legal_name: string;
  og_image_url: string | null;
};

export const DEFAULT_SITE_IDENTITY: SiteIdentityContent = {
  site_name: "Nyx Creators Hub",
  tagline: "The trusted marketplace connecting Africa's creative talent with brands who need them.",
  legal_name: "Nyx House of Creatives",
  og_image_url: null,
};

export async function getSiteIdentity(): Promise<SiteIdentityContent> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_pages")
    .select("content")
    .eq("slug", "site_identity")
    .maybeSingle();

  return { ...DEFAULT_SITE_IDENTITY, ...(data?.content as Partial<SiteIdentityContent> | undefined) };
}
