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

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

// The client-supplied Content-Type on a multipart upload can't be trusted on
// its own — a crafted request can declare any type it likes. This checks the
// actual leading bytes against known signatures for the types we accept.
async function sniffType(file: File): Promise<string | null> {
  const buf = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return "image/gif";
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 && // "RIFF"
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50 // "WEBP"
  )
    return "image/webp";
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return "application/pdf";

  return null;
}

export async function validateUpload(file: File): Promise<string | null> {
  if (file.size > MAX_BYTES) return "File must be under 10MB.";
  if (!ALLOWED_TYPES.has(file.type)) return "Only images and PDFs are allowed.";

  const sniffed = await sniffType(file);
  if (!sniffed || sniffed !== file.type) return "File content doesn't match its declared type.";

  return null;
}

// Derived from the (now content-verified) declared type — never from the
// client-supplied filename, which is untrusted input.
function extensionFor(mimeType: string) {
  return EXTENSION_BY_TYPE[mimeType] ?? "bin";
}

export async function uploadPublicMedia(
  supabase: SupabaseClient<Database>,
  userId: string,
  folder: "avatar" | "cover" | "portfolio" | "service" | "project" | "branding" | "brief",
  file: File
) {
  const error = await validateUpload(file);
  if (error) throw new Error(error);

  const path = `${userId}/${folder}/${crypto.randomUUID()}.${extensionFor(file.type)}`;
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
  const error = await validateUpload(file);
  if (error) throw new Error(error);

  const path = `${conversationId}/${crypto.randomUUID()}.${extensionFor(file.type)}`;
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
