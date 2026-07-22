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

async function createSquadInvite({
  projectId,
  creativeId,
  role,
  rateKes,
  redirectTo,
}: {
  projectId: string;
  creativeId: string;
  role: string;
  rateKes: number;
  redirectTo: string;
}) {
  const supabase = await createClient();

  if (!creativeId || !role || !rateKes || rateKes <= 0) {
    redirect(`${redirectTo}?error=${encodeURIComponent("Pick a creative, a role, and a positive rate.")}`);
  }

  const { error } = await supabase
    .from("project_squad_invites")
    .insert({ project_id: projectId, creative_id: creativeId, role, rate_kes: rateKes });

  if (error) {
    const message = error.code === "23505" ? "That creative already has an invite on this project." : error.message;
    redirect(`${redirectTo}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  redirect(`/dashboard/projects/${projectId}?saved=squad`);
}

export async function inviteToSquad(projectId: string, formData: FormData) {
  await requireBrand();
  const creativeId = String(formData.get("creative_id") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const rateKes = Number(formData.get("rate_kes"));

  await createSquadInvite({
    projectId,
    creativeId,
    role,
    rateKes,
    redirectTo: `/dashboard/projects/${projectId}`,
  });
}

export async function inviteCreativeToProject(creativeId: string, formData: FormData) {
  await requireBrand();
  const projectId = String(formData.get("project_id") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const rateKes = Number(formData.get("rate_kes"));

  if (!projectId) {
    redirect(`/creatives?error=${encodeURIComponent("Pick a project to invite this creative to.")}`);
  }

  await createSquadInvite({
    projectId,
    creativeId,
    role,
    rateKes,
    redirectTo: `/dashboard/projects/${projectId}`,
  });
}

export async function withdrawSquadInvite(id: string) {
  await requireBrand();
  const supabase = await createClient();
  const { data: invite } = await supabase
    .from("project_squad_invites")
    .update({ status: "withdrawn" })
    .eq("id", id)
    .select("project_id")
    .single();

  if (invite) revalidatePath(`/dashboard/projects/${invite.project_id}`);
}
