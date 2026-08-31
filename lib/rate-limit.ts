import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";

export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

// Best-effort fixed-window rate limiter backed by a small Postgres table —
// no new external service needed at this scale. Not perfectly atomic under
// heavy concurrency (read-then-write), which is an acceptable tradeoff for
// throttling abuse on low-traffic public forms (signup, password reset,
// contact) rather than a hard security boundary.
export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMinutes: number
): Promise<boolean> {
  const service = createServiceClient();
  const windowMs = windowMinutes * 60 * 1000;

  const { data: existing } = await service
    .from("rate_limits")
    .select("count, window_start")
    .eq("key", key)
    .maybeSingle();

  if (!existing || Date.now() - new Date(existing.window_start).getTime() > windowMs) {
    await service.from("rate_limits").upsert({ key, count: 1, window_start: new Date().toISOString() });
    return true;
  }

  if (existing.count >= maxAttempts) return false;

  await service.from("rate_limits").update({ count: existing.count + 1 }).eq("key", key);
  return true;
}
