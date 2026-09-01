import "server-only";
import { createServiceClient } from "@/lib/supabase/service";
import { sniffFromBytes } from "@/lib/storage";

// Message attachments upload directly from the browser to Storage (see
// components/messages/conversation-thread.tsx) instead of through the
// sendMessage server action — routing the raw bytes through a Server Action
// hits Vercel's hard 4.5MB request-body limit for anything bigger than a
// small image, well below what a real photo or PDF needs. That means the
// file's declared type is never independently checked against its actual
// content the way lib/storage.ts's validateUpload does for uploads that DO
// go through a server action, so this repeats that check after the fact via
// a small ranged read (Supabase Storage supports HTTP Range on object GETs),
// deleting the object if the bytes don't match what the client claimed.
export async function verifyMessageAttachment(path: string, declaredType: string): Promise<boolean> {
  const service = createServiceClient();

  const { data: signed } = await service.storage.from("message-attachments").createSignedUrl(path, 60);
  if (!signed?.signedUrl) return false;

  const res = await fetch(signed.signedUrl, { headers: { Range: "bytes=0-11" } });
  if (!res.ok && res.status !== 206) return false;

  const buf = new Uint8Array(await res.arrayBuffer());
  const sniffed = sniffFromBytes(buf);

  if (!sniffed || sniffed !== declaredType) {
    await service.storage.from("message-attachments").remove([path]);
    return false;
  }

  return true;
}
