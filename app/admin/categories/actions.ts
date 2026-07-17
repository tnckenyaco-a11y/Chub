"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function addCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await supabase.from("categories").insert({ name, slug: slugify(name) });
  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
}

export async function addFocusArea(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await supabase.from("focus_areas").insert({ name, slug: slugify(name) });
  revalidatePath("/admin/categories");
}

export async function deleteFocusArea(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("focus_areas").delete().eq("id", id);
  revalidatePath("/admin/categories");
}
