"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readPostFields(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim() || null,
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    body: String(formData.get("body") ?? ""),
    cover_image_url: String(formData.get("cover_image_url") ?? "").trim() || null,
  };
}

export async function createPost(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const fields = readPostFields(formData);
  if (!fields.title) redirect("/admin/blog/new?error=Title+is+required");

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({ ...fields, slug: slugify(fields.title), author_id: user.id })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/admin/blog/new?error=${encodeURIComponent(error?.message ?? "Could not create post.")}`);
  }

  revalidatePath("/admin/blog");
  redirect(`/admin/blog/${data.id}?saved=1`);
}

export async function updatePost(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const fields = readPostFields(formData);

  await supabase.from("blog_posts").update(fields).eq("id", id);

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  redirect(`/admin/blog/${id}?saved=1`);
}

export async function togglePublish(id: string, publish: boolean) {
  const { supabase } = await requireAdmin();
  await supabase
    .from("blog_posts")
    .update({
      status: publish ? "published" : "draft",
      published_at: publish ? new Date().toISOString() : null,
    })
    .eq("id", id);
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
}

export async function deletePost(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("blog_posts").delete().eq("id", id);
  revalidatePath("/admin/blog");
}
