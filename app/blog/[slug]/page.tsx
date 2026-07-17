import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, category, body, cover_image_url, published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
      {post.category && (
        <p className="text-xs font-semibold uppercase tracking-wide text-volt">
          {post.category}
        </p>
      )}
      <h1 className="font-display mt-2 text-4xl uppercase text-ink sm:text-5xl">
        {post.title}
      </h1>
      {post.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="mt-8 w-full rounded-2xl object-cover"
        />
      )}
      <div className="mt-8 whitespace-pre-wrap leading-relaxed text-ink/80">
        {post.body}
      </div>
    </article>
  );
}
