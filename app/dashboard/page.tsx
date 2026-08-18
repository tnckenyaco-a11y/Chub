import {
  Banknote,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  FileText,
  Flag,
  MessageCircle,
  Package,
  Star,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import { OnboardingChecklist, type OnboardingStep } from "@/components/onboarding-checklist";
import { EarningsChart, type MonthlyPoint } from "@/components/earnings-chart";
import { ActivityFeed, type ActivityItem } from "@/components/activity-feed";

const ICON_STYLES = [
  { icon: Briefcase, bg: "bg-grad-brand" },
  { icon: ClipboardList, bg: "bg-grad-volt" },
  { icon: CheckCircle2, bg: "bg-linear-to-br from-green to-green/70" },
  { icon: Banknote, bg: "bg-linear-to-br from-amber-400 to-amber-600" },
];

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const [stats, onboarding, monthlySeries, activity] = await Promise.all([
    getStats(supabase, profile.id, profile.role),
    getOnboardingSteps(supabase, profile.id, profile.role),
    getMonthlySeries(supabase, profile.id, profile.role),
    getActivity(supabase, profile.id, profile.role),
  ]);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
        {profile.role}
      </p>
      <h1 className="font-display mt-3 text-3xl text-ink sm:text-4xl">
        Welcome back, {profile.first_name || profile.username}
      </h1>

      {onboarding && <OnboardingChecklist steps={onboarding} />}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => {
          const style = ICON_STYLES[i % ICON_STYLES.length];
          const Icon: LucideIcon = style.icon;
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-line bg-paper p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                  {s.label}
                </p>
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.bg}`}>
                  <Icon className="h-5 w-5 text-paper" />
                </span>
              </div>
              <p className="font-display mt-4 text-3xl text-ink">{s.value}</p>
            </div>
          );
        })}
      </div>

      {(profile.role === "creative" || profile.role === "brand") && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EarningsChart
              title={profile.role === "creative" ? "Earnings" : "Spend"}
              emptyLabel={
                profile.role === "creative"
                  ? "No earnings yet — this fills in once your orders are completed."
                  : "No spend yet — this fills in once your orders are completed."
              }
              data={monthlySeries}
            />
          </div>
          <ActivityFeed items={activity} />
        </div>
      )}
    </div>
  );
}

async function getStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  role: "creative" | "brand" | "admin"
) {
  if (role === "creative") {
    const [{ count: services }, { count: orders }, { data: completed }] = await Promise.all([
      supabase.from("services").select("*", { count: "exact", head: true }).eq("creative_id", userId),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("creative_id", userId),
      supabase.from("orders").select("amount_kes").eq("creative_id", userId).eq("status", "completed"),
    ]);
    const revenue = (completed ?? []).reduce((sum, o) => sum + Number(o.amount_kes), 0);
    return [
      { label: "Services", value: services ?? 0 },
      { label: "Orders", value: orders ?? 0 },
      { label: "Completed", value: completed?.length ?? 0 },
      { label: "Revenue Earned", value: `Ksh ${revenue.toLocaleString()}` },
    ];
  }

  if (role === "brand") {
    const [{ count: projects }, { count: orders }, { data: completed }] = await Promise.all([
      supabase.from("projects").select("*", { count: "exact", head: true }).eq("brand_id", userId),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("brand_id", userId),
      supabase.from("orders").select("amount_kes").eq("brand_id", userId).eq("status", "completed"),
    ]);
    const spend = (completed ?? []).reduce((sum, o) => sum + Number(o.amount_kes), 0);
    return [
      { label: "Projects Posted", value: projects ?? 0 },
      { label: "Orders", value: orders ?? 0 },
      { label: "Completed", value: completed?.length ?? 0 },
      { label: "Total Spend", value: `Ksh ${spend.toLocaleString()}` },
    ];
  }

  return [];
}

async function getMonthlySeries(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  role: "creative" | "brand" | "admin"
): Promise<MonthlyPoint[]> {
  if (role !== "creative" && role !== "brand") return [];

  const since = new Date();
  since.setDate(1);
  since.setHours(0, 0, 0, 0);
  since.setMonth(since.getMonth() - 5);

  const idColumn = role === "creative" ? "creative_id" : "brand_id";
  const { data } = await supabase
    .from("orders")
    .select("amount_kes, updated_at")
    .eq(idColumn, userId)
    .eq("status", "completed")
    .gte("updated_at", since.toISOString());

  const months: (MonthlyPoint & { key: string })[] = [];
  const cursor = new Date(since);
  for (let i = 0; i < 6; i++) {
    months.push({
      key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      label: cursor.toLocaleDateString("en", { month: "short" }),
      value: 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  const byKey = new Map(months.map((m) => [m.key, m]));

  for (const order of data ?? []) {
    const d = new Date(order.updated_at);
    const point = byKey.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (point) point.value += Number(order.amount_kes);
  }

  return months.map(({ label, value }) => ({ label, value }));
}

const ORDER_STATUS_META: Record<
  string,
  { icon: LucideIcon; iconClass: string; text: (role: string) => string }
> = {
  pending_payment: {
    icon: Package,
    iconClass: "bg-brand/10 text-brand",
    text: () => "Order awaiting payment",
  },
  paid: {
    icon: Package,
    iconClass: "bg-brand/10 text-brand",
    text: () => "Order paid — work can begin",
  },
  in_progress: {
    icon: Package,
    iconClass: "bg-brand/10 text-brand",
    text: () => "Order marked in progress",
  },
  delivered: {
    icon: Package,
    iconClass: "bg-volt/10 text-volt",
    text: (role) => (role === "brand" ? "Delivery ready for your review" : "You delivered the order"),
  },
  completed: {
    icon: CheckCircle2,
    iconClass: "bg-green/10 text-green",
    text: (role) => (role === "creative" ? "Payment released — order completed" : "Order marked completed"),
  },
  disputed: {
    icon: Flag,
    iconClass: "bg-magenta/10 text-magenta",
    text: () => "Order is under dispute",
  },
  refunded: {
    icon: XCircle,
    iconClass: "bg-ink/8 text-ink/50",
    text: () => "Order refunded",
  },
  cancelled: {
    icon: XCircle,
    iconClass: "bg-ink/8 text-ink/50",
    text: () => "Order cancelled",
  },
};

async function getActivity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  role: "creative" | "brand" | "admin"
): Promise<ActivityItem[]> {
  if (role !== "creative" && role !== "brand") return [];

  const orderIdColumn = role === "creative" ? "creative_id" : "brand_id";

  const [{ data: orders }, { data: reviews }, { data: disputes }, { data: conversations }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id, status, updated_at")
        .eq(orderIdColumn, userId)
        .order("updated_at", { ascending: false })
        .limit(5),
      supabase
        .from("reviews")
        .select("id, overall_rating, created_at")
        .eq("reviewee_id", userId)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("disputes")
        .select(`id, status, created_at, resolved_at, orders!inner(${orderIdColumn})`)
        .eq(`orders.${orderIdColumn}`, userId)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("conversations")
        .select("id")
        .or(`user_one_id.eq.${userId},user_two_id.eq.${userId}`),
    ]);

  const conversationIds = (conversations ?? []).map((c) => c.id);
  const { data: unreadMessages } = conversationIds.length
    ? await supabase
        .from("messages")
        .select("id, created_at, conversation_id")
        .in("conversation_id", conversationIds)
        .neq("sender_id", userId)
        .is("read_at", null)
        .order("created_at", { ascending: false })
        .limit(3)
    : { data: [] };

  const items: ActivityItem[] = [];

  for (const order of orders ?? []) {
    const meta = ORDER_STATUS_META[order.status];
    if (!meta) continue;
    items.push({
      id: `order-${order.id}`,
      icon: meta.icon,
      iconClass: meta.iconClass,
      text: meta.text(role),
      time: order.updated_at,
      href: `/dashboard/orders/${order.id}`,
    });
  }

  for (const review of reviews ?? []) {
    items.push({
      id: `review-${review.id}`,
      icon: Star,
      iconClass: "bg-volt/10 text-volt",
      text: `New ${review.overall_rating}★ review received`,
      time: review.created_at,
    });
  }

  for (const dispute of disputes ?? []) {
    const resolved = dispute.status !== "open";
    items.push({
      id: `dispute-${dispute.id}`,
      icon: Flag,
      iconClass: resolved ? "bg-green/10 text-green" : "bg-magenta/10 text-magenta",
      text: resolved ? "Dispute resolved" : "Dispute opened on an order",
      time: dispute.resolved_at ?? dispute.created_at,
    });
  }

  for (const message of unreadMessages ?? []) {
    items.push({
      id: `message-${message.id}`,
      icon: MessageCircle,
      iconClass: "bg-brand/10 text-brand",
      text: "New message received",
      time: message.created_at,
      href: `/dashboard/messages/${message.conversation_id}`,
    });
  }

  if (role === "creative") {
    const { data: invites } = await supabase
      .from("project_squad_invites")
      .select("id, status, updated_at, projects(title)")
      .eq("creative_id", userId)
      .order("updated_at", { ascending: false })
      .limit(3);

    for (const invite of invites ?? []) {
      const title = invite.projects?.title;
      items.push({
        id: `invite-${invite.id}`,
        icon: Users,
        iconClass: invite.status === "invited" ? "bg-brand/10 text-brand" : "bg-ink/8 text-ink/50",
        text:
          invite.status === "invited"
            ? `New squad invite${title ? ` for "${title}"` : ""}`
            : `Squad invite ${invite.status}`,
        time: invite.updated_at,
        href: "/dashboard/proposals",
      });
    }
  }

  if (role === "brand") {
    const { data: proposals } = await supabase
      .from("proposals")
      .select("id, created_at, project_id, projects!inner(brand_id, title)")
      .eq("projects.brand_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(3);

    for (const proposal of proposals ?? []) {
      items.push({
        id: `proposal-${proposal.id}`,
        icon: FileText,
        iconClass: "bg-brand/10 text-brand",
        text: `New proposal on "${proposal.projects?.title ?? "your project"}"`,
        time: proposal.created_at,
        href: `/dashboard/projects/${proposal.project_id}`,
      });
    }
  }

  return items
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6);
}

async function getOnboardingSteps(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  role: "creative" | "brand" | "admin"
): Promise<OnboardingStep[] | null> {
  if (role !== "creative" && role !== "brand") return null;

  const { data: full } = await supabase
    .from("profiles")
    .select("avatar_url, bio, phone, onboarding_dismissed")
    .eq("id", userId)
    .single();

  if (full?.onboarding_dismissed) return null;

  const profileComplete = Boolean(full?.avatar_url && full?.bio);

  if (role === "creative") {
    const { count: services } = await supabase
      .from("services")
      .select("*", { count: "exact", head: true })
      .eq("creative_id", userId);

    return [
      {
        label: "Complete your profile",
        description: "Add a photo and a short bio so brands know who they're hiring.",
        done: profileComplete,
        href: "/dashboard/profile",
        cta: "Edit profile",
      },
      {
        label: "Add your M-Pesa payout number",
        description: "Required to actually receive payment once an order completes.",
        done: Boolean(full?.phone),
        href: "/dashboard/profile",
        cta: "Add number",
      },
      {
        label: "List your first service",
        description: "Publish a gig so brands can find and book you.",
        done: (services ?? 0) > 0,
        href: "/dashboard/services/new",
        cta: "Create service",
      },
    ];
  }

  const [{ count: projects }, { count: orders }] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("brand_id", userId),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("brand_id", userId),
  ]);

  return [
    {
      label: "Complete your profile",
      description: "Add a photo and a short bio so creatives know who they're working with.",
      done: profileComplete,
      href: "/dashboard/profile",
      cta: "Edit profile",
    },
    {
      label: "Post your first project",
      description: "Describe what you need and let creatives send you proposals.",
      done: (projects ?? 0) > 0,
      href: "/projects/new",
      cta: "Post a project",
    },
    {
      label: "Hire your first creative",
      description: "Book a service or accept a proposal to get your first order moving.",
      done: (orders ?? 0) > 0,
      href: "/creatives",
      cta: "Browse creatives",
    },
  ];
}
