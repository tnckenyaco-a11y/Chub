import { createClient } from "@/lib/supabase/server";
import { getSitePage } from "@/lib/site-pages";

type AdvanceConfig = {
  enabled: boolean;
  max_percent_of_order: number;
  min_completed_orders: number;
  min_avg_rating: number;
};

const DEFAULT_CONFIG: AdvanceConfig = {
  enabled: true,
  max_percent_of_order: 60,
  min_completed_orders: 3,
  min_avg_rating: 4,
};

const ELIGIBLE_ORDER_STATUSES = ["paid", "in_progress", "delivered"];

export type AdvanceEligibility =
  | { eligible: true; maxAmountKes: number; orderAmountKes: number }
  | { eligible: false; reason: string };

export async function getAdvanceEligibility(
  supabase: Awaited<ReturnType<typeof createClient>>,
  creativeId: string,
  orderId: string
): Promise<AdvanceEligibility> {
  const page = await getSitePage<AdvanceConfig>("financial_products_config");
  const config = page?.content ?? DEFAULT_CONFIG;

  if (!config.enabled) {
    return { eligible: false, reason: "Nyx Advance isn't available right now." };
  }

  const { data: order } = await supabase
    .from("orders")
    .select("amount_kes, creative_id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.creative_id !== creativeId) {
    return { eligible: false, reason: "Order not found." };
  }

  if (!ELIGIBLE_ORDER_STATUSES.includes(order.status)) {
    return { eligible: false, reason: "This order isn't eligible for an advance right now." };
  }

  const { data: existing } = await supabase
    .from("advance_requests")
    .select("id")
    .eq("order_id", orderId)
    .neq("status", "declined")
    .maybeSingle();

  if (existing) {
    return { eligible: false, reason: "There's already an advance request on this order." };
  }

  const [{ count: completedCount }, { data: reviews }] = await Promise.all([
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("creative_id", creativeId)
      .eq("status", "completed"),
    supabase.from("reviews").select("overall_rating").eq("reviewee_id", creativeId),
  ]);

  const ratings = reviews ?? [];
  const avgRating = ratings.length
    ? ratings.reduce((sum, r) => sum + r.overall_rating, 0) / ratings.length
    : 0;

  if ((completedCount ?? 0) < config.min_completed_orders) {
    return {
      eligible: false,
      reason: `You need at least ${config.min_completed_orders} completed orders to qualify.`,
    };
  }

  if (ratings.length > 0 && avgRating < config.min_avg_rating) {
    return {
      eligible: false,
      reason: `Your average rating needs to be at least ${config.min_avg_rating} to qualify.`,
    };
  }

  const maxAmountKes = Math.floor((order.amount_kes * config.max_percent_of_order) / 100);

  return { eligible: true, maxAmountKes, orderAmountKes: order.amount_kes };
}
