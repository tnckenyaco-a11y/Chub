import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, body, cover_image_url, published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!post) return {};

  const description = post.excerpt || post.body?.slice(0, 160);

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
      type: "article",
      publishedTime: post.published_at ?? undefined,
    },
  };
}

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
    <article className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
      <div className="flex items-center gap-2 text-xs text-ink/40">
        <Link href="/blog" className="hover:text-brand">Blog</Link>
        {post.category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span>{post.category}</span>
          </>
        )}
      </div>

      <div className="mt-6 text-center">
        {post.category && (
          <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand">
            {post.category}
          </span>
        )}
        <h1 className="font-display mt-4 text-3xl text-ink sm:text-4xl">
          {post.title}
        </h1>
        {post.published_at && (
          <p className="mt-3 text-xs text-ink/40">{formatDate(post.published_at)}</p>
        )}
      </div>

      {post.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="mt-10 aspect-video w-full rounded-2xl object-cover"
        />
      )}

      <div className="mt-10 whitespace-pre-wrap text-[15px] leading-loose text-ink/75">
        {post.body}
      </div>
    </article>
  );
}
