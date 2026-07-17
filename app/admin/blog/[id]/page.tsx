import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deletePost, togglePublish, updatePost } from "@/app/admin/blog/actions";
import { PostFields } from "@/components/blog-post-fields";

export default async function EditBlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("id, title, category, excerpt, body, cover_image_url, status")
    .eq("id", id)
    .maybeSingle();

  if (!post) notFound();

  const update = updatePost.bind(null, id);
  const publish = togglePublish.bind(null, id, post.status !== "published");
  const remove = deletePost.bind(null, id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl uppercase text-paper">Edit Post</h1>
        <span
          className={
            post.status === "published" ? "text-xs uppercase text-volt" : "text-xs uppercase text-paper/40"
          }
        >
          {post.status}
        </span>
      </div>

      {saved && (
        <p className="mt-6 rounded-lg border border-volt/40 bg-volt/10 px-4 py-3 text-sm text-volt">
          Saved.
        </p>
      )}

      <form action={update} className="mt-8 max-w-2xl space-y-5">
        <PostFields defaults={post} />
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-volt px-6 py-3 text-sm font-semibold uppercase tracking-wide text-ink"
          >
            Save
          </button>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap gap-3">
        <form action={publish}>
          <button
            type="submit"
            className="rounded-full border border-line px-6 py-3 text-sm font-semibold uppercase tracking-wide text-paper hover:border-paper"
          >
            {post.status === "published" ? "Unpublish" : "Publish"}
          </button>
        </form>
        <form action={remove}>
          <button
            type="submit"
            className="rounded-full border border-magenta/40 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-magenta hover:border-magenta"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
