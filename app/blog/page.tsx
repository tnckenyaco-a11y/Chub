import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ComingSoon } from "@/components/coming-soon";

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, title, category, excerpt, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (!posts?.length) {
    return <ComingSoon title="Blog" note="Posts are on the way." />;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10">
      <h1 className="font-display text-4xl uppercase text-ink">Blog</h1>
      <div className="mt-10 space-y-10">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
            {post.category && (
              <p className="text-xs font-semibold uppercase tracking-wide text-volt">
                {post.category}
              </p>
            )}
            <h2 className="font-display mt-2 text-2xl uppercase text-ink group-hover:text-volt">
              {post.title}
            </h2>
            {post.excerpt && <p className="mt-2 text-sm text-ink/60">{post.excerpt}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
