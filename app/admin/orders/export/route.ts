import { requireAdmin } from "@/lib/require-admin";
import { toCsv } from "@/lib/csv";
import { formatDate } from "@/lib/format";
import { expireStalePayments } from "@/lib/payments/expire-stale";

export async function GET() {
  const { supabase } = await requireAdmin();

  await expireStalePayments();

  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, amount_kes, status, created_at, brand:profiles!orders_brand_id_fkey(first_name, last_name), creative:profiles!orders_creative_id_fkey(first_name, last_name), payments(kind, status, provider, provider_ref)"
    )
    .order("created_at", { ascending: false });

  const rows = (orders ?? []).map((o) => ({
    id: o.id,
    created_at: formatDate(o.created_at),
    status: o.status,
    amount_kes: o.amount_kes,
    brand: `${o.brand?.first_name ?? ""} ${o.brand?.last_name ?? ""}`.trim(),
    creative: `${o.creative?.first_name ?? ""} ${o.creative?.last_name ?? ""}`.trim(),
    payments: (o.payments ?? [])
      .map((p) => `${p.kind}:${p.status}(${p.provider}${p.provider_ref ? `/${p.provider_ref}` : ""})`)
      .join("; "),
  }));

  const csv = toCsv(rows, [
    { key: "id", label: "Order ID" },
    { key: "created_at", label: "Created" },
    { key: "status", label: "Status" },
    { key: "amount_kes", label: "Amount (Ksh)" },
    { key: "brand", label: "Brand" },
    { key: "creative", label: "Creative" },
    { key: "payments", label: "Payments" },
  ]);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
