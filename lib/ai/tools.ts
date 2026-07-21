import type Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { releasePayoutForOrder } from "@/lib/payments/release-payout";

export type AgentProfile = {
  id: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
};

type ToolContext = {
  supabase: SupabaseClient<Database>;
  profile: AgentProfile;
};

type ToolResult = { ok: boolean; [key: string]: unknown };

const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "in_progress",
  "delivered",
  "completed",
  "disputed",
  "refunded",
  "cancelled",
] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

const PROPOSAL_STATUSES = ["pending", "accepted", "rejected", "withdrawn"] as const;
type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: "list_my_orders",
    description:
      "List the signed-in user's own orders (as a brand or a creative), most recent first. Use to answer any question about order status.",
    input_schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: [
            "pending_payment",
            "paid",
            "in_progress",
            "delivered",
            "completed",
            "disputed",
            "refunded",
            "cancelled",
          ],
          description: "Optional: only return orders in this status.",
        },
        limit: { type: "number", description: "Max results, default 10, max 20." },
      },
    },
  },
  {
    name: "get_earnings_summary",
    description:
      "Get the signed-in creative's earnings: total earned (all-time from completed orders), pending clearance (in-flight orders not yet paid out), and their last payout. Creatives only.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "list_my_proposals",
    description: "List the signed-in creative's own submitted proposals and their status. Creatives only.",
    input_schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["pending", "accepted", "rejected", "withdrawn"],
          description: "Optional: only return proposals in this status.",
        },
      },
    },
  },
  {
    name: "search_open_projects",
    description:
      "Search currently published, open brand projects a creative could send a proposal to. Returns each project's id (needed for submit_proposal), title, and budget range. Creatives only.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Optional keyword to search project titles." },
      },
    },
  },
  {
    name: "submit_proposal",
    description:
      "Send a proposal from the signed-in creative to a brand's open project. Requires the project_id from search_open_projects. Creatives only.",
    input_schema: {
      type: "object",
      properties: {
        project_id: { type: "string", description: "The project's id, from search_open_projects." },
        rate: { type: "number", description: "The creative's proposed rate in KES." },
        message: { type: "string", description: "Optional pitch message to the brand." },
      },
      required: ["project_id", "rate"],
    },
  },
  {
    name: "advance_order_status",
    description:
      "Move one of the signed-in creative's own orders forward: 'start_work' (paid -> in_progress) or 'mark_delivered' (-> delivered, ready for the brand to review). Creatives only.",
    input_schema: {
      type: "object",
      properties: {
        order_id: { type: "string" },
        action: { type: "string", enum: ["start_work", "mark_delivered"] },
      },
      required: ["order_id", "action"],
    },
  },
  {
    name: "approve_and_release_order",
    description:
      "Approve a delivered order and release the M-Pesa payout to the creative. This moves real money and cannot be undone. Brands only. The FIRST call must be made with confirm=false to preview what will happen; only call again with confirm=true after the user has explicitly said to proceed in this conversation.",
    input_schema: {
      type: "object",
      properties: {
        order_id: { type: "string" },
        confirm: { type: "boolean", description: "Set true only after the user explicitly confirms." },
      },
      required: ["order_id", "confirm"],
    },
  },
];

export async function runTool(
  name: string,
  input: Record<string, unknown>,
  ctx: ToolContext
): Promise<ToolResult> {
  switch (name) {
    case "list_my_orders":
      return listMyOrders(input, ctx);
    case "get_earnings_summary":
      return getEarningsSummary(ctx);
    case "list_my_proposals":
      return listMyProposals(input, ctx);
    case "search_open_projects":
      return searchOpenProjects(input, ctx);
    case "submit_proposal":
      return submitProposal(input, ctx);
    case "advance_order_status":
      return advanceOrderStatus(input, ctx);
    case "approve_and_release_order":
      return approveAndReleaseOrder(input, ctx);
    default:
      return { ok: false, error: `Unknown tool: ${name}` };
  }
}

async function listMyOrders(input: Record<string, unknown>, { supabase, profile }: ToolContext) {
  const limit = Math.min(Number(input.limit) || 10, 20);
  let query = supabase
    .from("orders")
    .select("id, amount_kes, status, created_at, brand_id, creative_id")
    .or(`brand_id.eq.${profile.id},creative_id.eq.${profile.id}`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (ORDER_STATUSES.includes(input.status as OrderStatus)) {
    query = query.eq("status", input.status as OrderStatus);
  }

  const { data: orders } = await query;
  const counterpartIds = (orders ?? []).map((o) =>
    o.brand_id === profile.id ? o.creative_id : o.brand_id
  );
  const { data: counterparts } = counterpartIds.length
    ? await supabase.from("public_profiles").select("id, first_name, last_name").in("id", counterpartIds)
    : { data: [] };
  const counterpartById = new Map((counterparts ?? []).map((c) => [c.id, c]));

  return {
    ok: true,
    orders: (orders ?? []).map((o) => {
      const counterpart = counterpartById.get(o.brand_id === profile.id ? o.creative_id : o.brand_id);
      return {
        id: o.id,
        amount_kes: o.amount_kes,
        status: o.status,
        created_at: o.created_at,
        counterparty: counterpart ? `${counterpart.first_name} ${counterpart.last_name}` : "Unknown",
        role_in_order: o.brand_id === profile.id ? "brand" : "creative",
      };
    }),
  };
}

async function getEarningsSummary({ supabase, profile }: ToolContext) {
  if (profile.role !== "creative") {
    return { ok: false, error: "Earnings are only available to creative accounts." };
  }

  const [{ data: completedOrders }, { data: pendingOrders }, { data: payouts }] = await Promise.all([
    supabase.from("orders").select("amount_kes").eq("creative_id", profile.id).eq("status", "completed"),
    supabase
      .from("orders")
      .select("amount_kes")
      .eq("creative_id", profile.id)
      .in("status", ["paid", "in_progress", "delivered"]),
    supabase
      .from("payments")
      .select("amount_kes, status, created_at, orders!inner(creative_id)")
      .eq("kind", "payout")
      .eq("orders.creative_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const totalEarned = (completedOrders ?? []).reduce((sum, o) => sum + Number(o.amount_kes), 0);
  const pendingClearance = (pendingOrders ?? []).reduce((sum, o) => sum + Number(o.amount_kes), 0);
  const lastPayout = payouts?.[0] ?? null;

  return {
    ok: true,
    total_earned_kes: totalEarned,
    pending_clearance_kes: pendingClearance,
    last_payout: lastPayout
      ? { amount_kes: lastPayout.amount_kes, status: lastPayout.status, date: lastPayout.created_at }
      : null,
  };
}

async function listMyProposals(input: Record<string, unknown>, { supabase, profile }: ToolContext) {
  if (profile.role !== "creative") {
    return { ok: false, error: "Proposals are only available to creative accounts." };
  }

  let query = supabase
    .from("proposals")
    .select("id, rate, status, created_at, project:projects(title)")
    .eq("creative_id", profile.id)
    .order("created_at", { ascending: false });

  if (PROPOSAL_STATUSES.includes(input.status as ProposalStatus)) {
    query = query.eq("status", input.status as ProposalStatus);
  }

  const { data: proposals } = await query;
  return {
    ok: true,
    proposals: (proposals ?? []).map((p) => ({
      id: p.id,
      project_title: p.project?.title ?? "Unknown project",
      rate_kes: p.rate,
      status: p.status,
      created_at: p.created_at,
    })),
  };
}

async function searchOpenProjects(input: Record<string, unknown>, { profile, supabase }: ToolContext) {
  if (profile.role !== "creative") {
    return { ok: false, error: "Only creative accounts can browse projects to propose on." };
  }

  let query = supabase
    .from("projects")
    .select("id, title, budget_min, budget_max, pricing_type")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(15);

  if (typeof input.query === "string" && input.query.trim()) {
    query = query.ilike("title", `%${input.query.trim()}%`);
  }

  const { data: projects } = await query;
  return {
    ok: true,
    projects: (projects ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      budget_kes: `${p.budget_min}-${p.budget_max}`,
      pricing_type: p.pricing_type,
    })),
  };
}

async function submitProposal(input: Record<string, unknown>, { supabase, profile }: ToolContext) {
  if (profile.role !== "creative") {
    return { ok: false, error: "Only creative accounts can submit proposals." };
  }
  const projectId = String(input.project_id ?? "");
  const rate = Number(input.rate);
  if (!projectId || !rate || rate <= 0) {
    return { ok: false, error: "A valid project_id and a positive rate are required." };
  }

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      project_id: projectId,
      creative_id: profile.id,
      rate,
      message: typeof input.message === "string" ? input.message.trim() : "",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "You've already sent a proposal for this project." };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true, proposal_id: data.id, message: "Proposal sent." };
}

async function advanceOrderStatus(input: Record<string, unknown>, { supabase, profile }: ToolContext) {
  if (profile.role !== "creative") {
    return { ok: false, error: "Only the creative on an order can advance its status." };
  }
  const orderId = String(input.order_id ?? "");
  const action = input.action === "mark_delivered" ? "delivered" : "in_progress";
  if (!orderId) return { ok: false, error: "order_id is required." };

  const { data, error } = await supabase
    .from("orders")
    .update({ status: action })
    .eq("id", orderId)
    .eq("creative_id", profile.id)
    .select("id, status")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Order not found, or it doesn't belong to you." };

  return { ok: true, order_id: data.id, new_status: data.status };
}

async function approveAndReleaseOrder(input: Record<string, unknown>, { supabase, profile }: ToolContext) {
  if (profile.role !== "brand") {
    return { ok: false, error: "Only the brand on an order can approve and release payment." };
  }
  const orderId = String(input.order_id ?? "");
  if (!orderId) return { ok: false, error: "order_id is required." };

  const { data: order } = await supabase
    .from("orders")
    .select("id, amount_kes, status")
    .eq("id", orderId)
    .eq("brand_id", profile.id)
    .maybeSingle();

  if (!order) return { ok: false, error: "Order not found, or it doesn't belong to you." };
  if (order.status !== "delivered") {
    return {
      ok: false,
      error: `This order is currently "${order.status}", not "delivered" — it isn't ready to approve yet.`,
    };
  }

  if (input.confirm !== true) {
    return {
      ok: true,
      needs_confirmation: true,
      order_id: order.id,
      amount_kes: order.amount_kes,
      message: `This will release Ksh ${order.amount_kes.toLocaleString()} to the creative via M-Pesa and cannot be undone. Ask the user to confirm before calling this tool again with confirm=true.`,
    };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "completed" })
    .eq("id", orderId)
    .eq("brand_id", profile.id);

  if (error) return { ok: false, error: error.message };

  await releasePayoutForOrder(orderId);
  return { ok: true, order_id: orderId, message: "Order approved and payout released." };
}
