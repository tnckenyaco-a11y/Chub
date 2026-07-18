"use server";

import { revalidatePath } from "next/cache";
import { redirect, forbidden } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";
import { uploadPublicMedia } from "@/lib/storage";

async function requireBrand() {
  const profile = await requireProfile();
  if (profile.role !== "brand") forbidden();
  return profile;
}

export async function createProject(formData: FormData) {
  const profile = await requireBrand();
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "") || null;
  const focusAreaIds = formData.getAll("focus_area_ids").map(String);
  const pricingType = formData.get("pricing_type") === "hourly" ? "hourly" : "fixed";
  const budgetMin = Number(formData.get("budget_min"));
  const budgetMax = Number(formData.get("budget_max"));

  if (!title || Number.isNaN(budgetMin) || Number.isNaN(budgetMax) || budgetMax < budgetMin) {
    redirect("/projects/new?error=Please+fill+in+a+title+and+a+valid+budget+range.");
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      brand_id: profile.id,
      title,
      description,
      category_id: categoryId,
      pricing_type: pricingType,
      budget_min: budgetMin,
      budget_max: budgetMax,
      slug: `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`,
    })
    .select("id")
    .single();

  if (error || !project) {
    redirect(`/projects/new?error=${encodeURIComponent(error?.message ?? "Could not post project.")}`);
  }

  if (focusAreaIds.length) {
    await supabase
      .from("project_focus_areas")
      .insert(focusAreaIds.map((focus_area_id) => ({ project_id: project.id, focus_area_id })));
  }

  revalidatePath("/dashboard/projects");
  redirect(`/dashboard/projects/${project.id}?saved=1`);
}

export async function updateProject(id: string, formData: FormData) {
  const profile = await requireBrand();
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "") || null;

  await supabase
    .from("projects")
    .update({ title, description, category_id: categoryId })
    .eq("id", id)
    .eq("brand_id", profile.id);

  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${id}`);
  redirect(`/dashboard/projects/${id}?saved=1`);
}

export async function closeProject(id: string) {
  await requireBrand();
  const supabase = await createClient();
  await supabase.from("projects").update({ status: "archived" }).eq("id", id);
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${id}`);
}

export async function deleteProject(id: string) {
  await requireBrand();
  const supabase = await createClient();
  await supabase.from("projects").delete().eq("id", id);
  revalidatePath("/dashboard/projects");
  redirect("/dashboard/projects");
}

export async function addProjectImage(projectId: string, formData: FormData) {
  const profile = await requireBrand();
  const supabase = await createClient();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;

  const url = await uploadPublicMedia(supabase, profile.id, "project", file);
  const { count } = await supabase
    .from("project_images")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  await supabase.from("project_images").insert({
    project_id: projectId,
    file_url: url,
    sort_order: count ?? 0,
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function deleteProjectImage(projectId: string, imageId: string) {
  await requireBrand();
  const supabase = await createClient();
  await supabase.from("project_images").delete().eq("id", imageId);
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function decideProposal(id: string, status: "accepted" | "rejected") {
  await requireBrand();
  const supabase = await createClient();
  const { data: proposal } = await supabase
    .from("proposals")
    .update({ status })
    .eq("id", id)
    .select("project_id")
    .single();

  if (proposal) revalidatePath(`/dashboard/projects/${proposal.project_id}`);
}
