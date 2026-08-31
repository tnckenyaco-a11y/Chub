"use server";

import { revalidatePath } from "next/cache";
import { redirect, forbidden } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";
import { uploadPublicMedia } from "@/lib/storage";

async function requireCreative() {
  const profile = await requireProfile();
  if (profile.role !== "creative") forbidden();
  return profile;
}

export async function createService(formData: FormData) {
  const profile = await requireCreative();
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "") || null;
  const focusAreaIds = formData.getAll("focus_area_ids").map(String);

  const packageTitle = String(formData.get("package_title") ?? "").trim() || "Standard";
  const priceKes = Number(formData.get("price_kes"));
  const deliveryDays = Number(formData.get("delivery_days"));
  const revisions = Number(formData.get("revisions") ?? 1);

  if (!title || !priceKes || !deliveryDays) {
    redirect("/dashboard/services/new?error=Title,+price,+and+delivery+time+are+required.");
  }

  const { data: service, error } = await supabase
    .from("services")
    .insert({
      creative_id: profile.id,
      title,
      description,
      category_id: categoryId,
      slug: `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`,
    })
    .select("id")
    .single();

  if (error || !service) {
    redirect(`/dashboard/services/new?error=${encodeURIComponent(error?.message ?? "Could not create service.")}`);
  }

  if (focusAreaIds.length) {
    await supabase
      .from("service_focus_areas")
      .insert(focusAreaIds.map((focus_area_id) => ({ service_id: service.id, focus_area_id })));
  }

  await supabase.from("service_packages").insert({
    service_id: service.id,
    title: packageTitle,
    price_kes: priceKes,
    delivery_days: deliveryDays,
    revisions,
  });

  revalidatePath("/dashboard/services");
  redirect(`/dashboard/services/${service.id}?saved=1`);
}

export async function updateService(id: string, formData: FormData) {
  const profile = await requireCreative();
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "") || null;

  await supabase
    .from("services")
    .update({ title, description, category_id: categoryId })
    .eq("id", id)
    .eq("creative_id", profile.id);

  revalidatePath("/dashboard/services");
  revalidatePath(`/dashboard/services/${id}`);
  redirect(`/dashboard/services/${id}?saved=1`);
}

export async function deleteService(id: string) {
  const profile = await requireCreative();
  const supabase = await createClient();
  await supabase.from("services").delete().eq("id", id).eq("creative_id", profile.id);
  revalidatePath("/dashboard/services");
  redirect("/dashboard/services");
}

async function requireOwnedService(supabase: Awaited<ReturnType<typeof createClient>>, serviceId: string, creativeId: string) {
  const { data: service } = await supabase
    .from("services")
    .select("id")
    .eq("id", serviceId)
    .eq("creative_id", creativeId)
    .maybeSingle();
  return Boolean(service);
}

export async function addPackage(serviceId: string, formData: FormData) {
  const profile = await requireCreative();
  const supabase = await createClient();

  if (!(await requireOwnedService(supabase, serviceId, profile.id))) return;

  await supabase.from("service_packages").insert({
    service_id: serviceId,
    title: String(formData.get("title") ?? "").trim() || "Package",
    description: String(formData.get("description") ?? "").trim(),
    price_kes: Number(formData.get("price_kes")),
    delivery_days: Number(formData.get("delivery_days")),
    revisions: Number(formData.get("revisions") ?? 1),
  });

  revalidatePath(`/dashboard/services/${serviceId}`);
}

export async function deletePackage(serviceId: string, packageId: string) {
  const profile = await requireCreative();
  const supabase = await createClient();

  if (!(await requireOwnedService(supabase, serviceId, profile.id))) return;

  await supabase.from("service_packages").delete().eq("id", packageId).eq("service_id", serviceId);
  revalidatePath(`/dashboard/services/${serviceId}`);
}

export async function addServiceImage(serviceId: string, formData: FormData) {
  const profile = await requireCreative();
  const supabase = await createClient();

  if (!(await requireOwnedService(supabase, serviceId, profile.id))) return;

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return;

  const url = await uploadPublicMedia(supabase, profile.id, "service", file);
  const { count } = await supabase
    .from("service_images")
    .select("*", { count: "exact", head: true })
    .eq("service_id", serviceId);

  await supabase.from("service_images").insert({
    service_id: serviceId,
    file_url: url,
    sort_order: count ?? 0,
  });

  revalidatePath(`/dashboard/services/${serviceId}`);
}

export async function deleteServiceImage(serviceId: string, imageId: string) {
  const profile = await requireCreative();
  const supabase = await createClient();

  if (!(await requireOwnedService(supabase, serviceId, profile.id))) return;

  await supabase.from("service_images").delete().eq("id", imageId).eq("service_id", serviceId);
  revalidatePath(`/dashboard/services/${serviceId}`);
}
