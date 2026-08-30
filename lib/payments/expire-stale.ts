import { createServiceClient } from "@/lib/supabase/service";

const STALE_MINUTES = 10;

// A collection payment (STK push, card checkout) still "pending" past this
// long is treated as abandoned — the payer never finished, or the provider
// never called back. Payouts are excluded: manual mode waits on an admin to
// actually send money, which can legitimately take longer. This isn't
// destructive — if a slow-but-real webhook still arrives afterward,
// handleCollectionEvent overwrites the status again either way.
//
// Uses the service-role client regardless of caller: payments RLS only
// allows admin UPDATE, but this needs to self-heal from brand/creative-facing
// pages too (their own order detail page), not just admin ones.
export async function expireStalePayments() {
  const cutoff = new Date(Date.now() - STALE_MINUTES * 60 * 1000).toISOString();
  await createServiceClient()
    .from("payments")
    .update({ status: "failed" })
    .eq("kind", "collection")
    .eq("status", "pending")
    .lt("created_at", cutoff);
}
