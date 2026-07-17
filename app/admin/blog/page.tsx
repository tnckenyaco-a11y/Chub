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
        <h1 className="font-display text-4xl uppercase text-paper">Blog</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-full bg-volt px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink"
        >
          New Post
        </Link>
      </div>

      <ul className="mt-8 space-y-2">
        {posts?.map((p) => (
          <li key={p.id}>
            <Link
              href={`/admin/blog/${p.id}`}
              className="flex items-center justify-between rounded-lg border border-line px-4 py-3 transition hover:border-volt"
            >
              <span className="text-paper">{p.title}</span>
              <span
                className={
                  p.status === "published"
                    ? "text-xs uppercase text-volt"
                    : "text-xs uppercase text-paper/40"
                }
              >
                {p.status}
              </span>
            </Link>
          </li>
        ))}
        {!posts?.length && <p className="text-sm text-paper/40">No posts yet.</p>}
      </ul>
    </div>
  );
}
