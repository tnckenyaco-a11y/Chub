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
  folder: "avatar" | "cover" | "portfolio" | "service" | "project" | "branding",
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

export type MediaAsset = {
  path: string;
  url: string;
  updatedAt: string;
  sizeBytes: number;
  kind: "image" | "pdf";
};

// public-media is laid out as {userId}/{folder}/{file}, so this walks exactly
// those two levels rather than a generic recursive crawl.
export async function listPublicMedia(supabase: SupabaseClient<Database>): Promise<MediaAsset[]> {
  const bucket = supabase.storage.from("public-media");
  const assets: MediaAsset[] = [];

  const { data: userFolders } = await bucket.list("", { limit: 1000 });
  for (const userFolder of userFolders ?? []) {
    if (userFolder.id) continue; // a real file at root, not a user folder — skip

    const { data: typeFolders } = await bucket.list(userFolder.name, { limit: 100 });
    for (const typeFolder of typeFolders ?? []) {
      if (typeFolder.id) continue;

      const dir = `${userFolder.name}/${typeFolder.name}`;
      const { data: files } = await bucket.list(dir, { limit: 500 });
      for (const file of files ?? []) {
        if (!file.id) continue;
        const path = `${dir}/${file.name}`;
        const {
          data: { publicUrl },
        } = bucket.getPublicUrl(path);
        const metadata = file.metadata as { size?: number; mimetype?: string } | null;
        assets.push({
          path,
          url: publicUrl,
          updatedAt: file.updated_at ?? file.created_at ?? "",
          sizeBytes: metadata?.size ?? 0,
          kind: metadata?.mimetype === "application/pdf" ? "pdf" : "image",
        });
      }
    }
  }

  return assets.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deletePublicMedia(supabase: SupabaseClient<Database>, path: string) {
  await supabase.storage.from("public-media").remove([path]);
}
