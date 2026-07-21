import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, status, published_at, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Blog</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-full bg-grad-brand px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
        >
          New Post
        </Link>
      </div>

      <ul className="mt-8 space-y-2">
        {posts?.map((p) => (
          <li key={p.id}>
            <Link
              href={`/admin/blog/${p.id}`}
              className="flex items-center justify-between rounded-xl border border-line bg-paper px-5 py-3.5 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-sm"
            >
              <span className="font-medium text-ink">{p.title}</span>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                  p.status === "published" ? "bg-green/10 text-green" : "bg-ink/8 text-ink/55"
                }`}
              >
                {p.status}
              </span>
            </Link>
          </li>
        ))}
        {!posts?.length && <p className="text-sm text-ink/40">No posts yet.</p>}
      </ul>
    </div>
  );
}
