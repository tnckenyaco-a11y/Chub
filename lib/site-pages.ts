import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

export async function getSitePage<T = Record<string, Json>>(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_pages")
    .select("title, content")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return null;
  return { title: data.title, content: data.content as T };
}
