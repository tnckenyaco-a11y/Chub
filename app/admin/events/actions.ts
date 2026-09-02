"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function readEventFields(formData: FormData) {
  const startsAt = String(formData.get("starts_at") ?? "").trim();
  const endsAt = String(formData.get("ends_at") ?? "").trim();
  return {
    title: String(formData.get("title") ?? "").trim(),
    event_type: formData.get("event_type") === "workshop" ? "workshop" : "event",
    location: String(formData.get("location") ?? "").trim() || null,
    starts_at: startsAt ? new Date(startsAt).toISOString() : "",
    ends_at: endsAt ? new Date(endsAt).toISOString() : null,
    registration_url: String(formData.get("registration_url") ?? "").trim() || null,
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    body: String(formData.get("body") ?? "").trim() || null,
    cover_image_url: String(formData.get("cover_image_url") ?? "").trim() || null,
  };
}

export async function createEvent(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const fields = readEventFields(formData);
  if (!fields.title) redirect("/admin/events/new?error=Title+is+required");
  if (!fields.starts_at) redirect("/admin/events/new?error=Start+date+is+required");

  const { data, error } = await supabase
    .from("events")
    .insert({ ...fields, slug: slugify(fields.title), author_id: user.id })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/admin/events/new?error=${encodeURIComponent(error?.message ?? "Could not create event.")}`);
  }
  revalidatePath("/admin/events");
  revalidatePath("/");
  redirect(`/admin/events/${data.id}?saved=1`);
}

export async function updateEvent(id: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const fields = readEventFields(formData);
  if (!fields.title) redirect(`/admin/events/${id}?error=Title+is+required`);
  if (!fields.starts_at) redirect(`/admin/events/${id}?error=Start+date+is+required`);

  await supabase.from("events").update(fields).eq("id", id);
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
  revalidatePath("/");
  revalidatePath("/events");
  redirect(`/admin/events/${id}?saved=1`);
}

export async function togglePublish(id: string, publish: boolean) {
  const { supabase } = await requireAdmin();
  await supabase
    .from("events")
    .update({
      status: publish ? "published" : "draft",
      published_at: publish ? new Date().toISOString() : null,
    })
    .eq("id", id);
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
  revalidatePath("/");
  revalidatePath("/events");
}

export async function deleteEvent(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("events").delete().eq("id", id);
  revalidatePath("/admin/events");
  revalidatePath("/");
  revalidatePath("/events");
}
