import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ComingSoon } from "@/components/coming-soon";

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, title, category, excerpt, cover_image_url, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (!posts?.length) {
    return <ComingSoon title="Blog" note="Posts are on the way." />;
  }

  const [featured, ...rest] = posts;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-volt">The Journal</p>
        <h1 className="font-display mt-2 text-4xl text-ink">
          Stories from Africa&apos;s <span className="font-accent">creative economy</span>
        </h1>
      </div>

      <Link
        href={`/blog/${featured.slug}`}
        className="group relative mt-12 block overflow-hidden rounded-3xl bg-ink"
      >
        <div
          className="aspect-[21/9] bg-cover bg-center bg-grad-brand transition duration-500 group-hover:scale-[1.03]"
          style={
            featured.cover_image_url
              ? { backgroundImage: `url(${featured.cover_image_url})` }
              : undefined
          }
        />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
          {featured.category && (
            <span className="inline-block rounded-full bg-grad-volt px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">
              {featured.category}
            </span>
          )}
          <h2 className="font-display mt-4 max-w-2xl text-2xl text-paper sm:text-3xl">
            {featured.title}
          </h2>
          {featured.excerpt && (
            <p className="mt-2 max-w-xl text-sm text-paper/70">{featured.excerpt}</p>
          )}
        </div>
      </Link>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
            <div
              className="aspect-4/3 rounded-2xl bg-cover bg-center bg-grad-brand transition group-hover:shadow-lg"
              style={
                post.cover_image_url ? { backgroundImage: `url(${post.cover_image_url})` } : undefined
              }
            />
            {post.category && (
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-brand">
                {post.category}
              </p>
            )}
            <h2 className="font-display mt-1.5 text-lg text-ink transition group-hover:text-brand">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="mt-2 line-clamp-2 text-sm text-ink/55">{post.excerpt}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
