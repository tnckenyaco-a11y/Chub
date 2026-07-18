import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB, matches the bucket's file_size_limit
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

export function validateUpload(file: File) {
  if (file.size > MAX_BYTES) return "File must be under 10MB.";
  if (!ALLOWED_TYPES.has(file.type)) return "Only images and PDFs are allowed.";
  return null;
}

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  return file.type === "application/pdf" ? "pdf" : "png";
}

export async function uploadPublicMedia(
  supabase: SupabaseClient<Database>,
  userId: string,
  folder: "avatar" | "cover" | "portfolio" | "service" | "project",
  file: File
) {
  const error = validateUpload(file);
  if (error) throw new Error(error);

  const path = `${userId}/${folder}/${crypto.randomUUID()}.${extensionFor(file)}`;
  const { error: uploadError } = await supabase.storage
    .from("public-media")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("public-media").getPublicUrl(path);
  return publicUrl;
}

// Returns the storage PATH, not a URL — message-attachments is a private
// bucket, so a fresh signed URL must be generated at render time instead of
// persisting one (which would expire).
export async function uploadMessageAttachment(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  file: File
) {
  const error = validateUpload(file);
  if (error) throw new Error(error);

  const path = `${conversationId}/${crypto.randomUUID()}.${extensionFor(file)}`;
  const { error: uploadError } = await supabase.storage
    .from("message-attachments")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;

  return path;
}

export async function signMessageAttachment(
  supabase: SupabaseClient<Database>,
  path: string
) {
  const { data } = await supabase.storage
    .from("message-attachments")
    .createSignedUrl(path, 60 * 60); // 1 hour, plenty for a single page view
  return data?.signedUrl ?? null;
}

export function fileKind(mimeType: string): "image" | "pdf" {
  return mimeType === "application/pdf" ? "pdf" : "image";
}
