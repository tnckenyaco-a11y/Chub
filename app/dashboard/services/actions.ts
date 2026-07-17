"use server";

import { revalidatePath } from "next/cache";
import { redirect, forbidden } from "next/navigation";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";

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
  await requireCreative();
  const supabase = await createClient();
  await supabase.from("services").delete().eq("id", id);
  revalidatePath("/dashboard/services");
  redirect("/dashboard/services");
}

export async function addPackage(serviceId: string, formData: FormData) {
  await requireCreative();
  const supabase = await createClient();

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
  await requireCreative();
  const supabase = await createClient();
  await supabase.from("service_packages").delete().eq("id", packageId);
  revalidatePath(`/dashboard/services/${serviceId}`);
}
