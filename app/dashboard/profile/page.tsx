import { requireProfile } from "@/lib/current-user";
import { createClient } from "@/lib/supabase/server";
import {
  addPortfolioItem,
  deletePortfolioItem,
  updateProfileDetails,
  uploadAvatar,
  uploadCover,
} from "@/app/dashboard/profile/actions";
import { AutoSubmitFileInput } from "@/components/auto-submit-file-input";

type SocialLinks = {
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  tiktok?: string;
  youtube?: string;
};

export default async function ProfilePage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const [{ data: full }, { data: portfolio }] = await Promise.all([
    supabase
      .from("profiles")
      .select("avatar_url, cover_url, bio, website_url, social_links, phone, city, country")
      .eq("id", profile.id)
      .single(),
    supabase
      .from("portfolio_items")
      .select("id, title, file_url, file_type, link_url")
      .eq("profile_id", profile.id)
      .order("sort_order"),
  ]);

  const social = (full?.social_links ?? {}) as SocialLinks;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl text-ink">Profile</h1>

      {/* Avatar + cover uploads */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Your Photo
          </p>
          <div className="mt-2 flex items-center gap-4">
            <div
              className="h-20 w-20 shrink-0 rounded-full bg-grad-brand bg-cover bg-center"
              style={full?.avatar_url ? { backgroundImage: `url(${full.avatar_url})` } : undefined}
            />
            <form action={uploadAvatar}>
              <AutoSubmitFileInput name="avatar" accept="image/png,image/jpeg,image/webp,image/gif" />
            </form>
          </div>
          <p className="mt-2 text-xs text-ink/40">Max file size 10MB.</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Cover Image
          </p>
          <div
            className="mt-2 h-20 w-full rounded-xl bg-grad-brand bg-cover bg-center"
            style={full?.cover_url ? { backgroundImage: `url(${full.cover_url})` } : undefined}
          />
          <form action={uploadCover} className="mt-2">
            <AutoSubmitFileInput name="cover" accept="image/png,image/jpeg,image/webp,image/gif" />
          </form>
          <p className="mt-2 text-xs text-ink/40">Recommended 1920×400px, max 10MB.</p>
        </div>
      </div>

      {/* Details form */}
      <form action={updateProfileDetails} className="mt-10 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" name="first_name" defaultValue={profile.first_name} />
          <Field label="Last name" name="last_name" defaultValue={profile.last_name} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phone" name="phone" type="tel" defaultValue={full?.phone ?? ""} />
          <Field label="City" name="city" defaultValue={full?.city ?? ""} />
        </div>
        <Field label="Country" name="country" defaultValue={full?.country ?? ""} />
        <Field label="Website" name="website_url" type="url" defaultValue={full?.website_url ?? ""} />

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">Bio</span>
          <textarea
            name="bio"
            rows={5}
            defaultValue={full?.bio ?? ""}
            placeholder="Tell brands and creatives about yourself…"
            className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-brand"
          />
        </label>

        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Social Links
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <Field label="Instagram" name="social_instagram" defaultValue={social.instagram ?? ""} placeholder="https://instagram.com/…" />
            <Field label="Twitter / X" name="social_twitter" defaultValue={social.twitter ?? ""} placeholder="https://x.com/…" />
            <Field label="LinkedIn" name="social_linkedin" defaultValue={social.linkedin ?? ""} placeholder="https://linkedin.com/in/…" />
            <Field label="TikTok" name="social_tiktok" defaultValue={social.tiktok ?? ""} placeholder="https://tiktok.com/@…" />
            <Field label="YouTube" name="social_youtube" defaultValue={social.youtube ?? ""} placeholder="https://youtube.com/@…" />
          </div>
        </fieldset>

        <button
          type="submit"
          className="rounded-full bg-grad-brand px-6 py-3 text-sm font-semibold uppercase tracking-wide text-paper shadow-sm transition hover:opacity-90"
        >
          Save
        </button>
      </form>

      {/* Portfolio */}
      <section className="mt-14">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Portfolio</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {portfolio?.map((item) => {
            const remove = deletePortfolioItem.bind(null, item.id);
            return (
              <div key={item.id} className="overflow-hidden rounded-xl border border-line">
                {item.file_type === "pdf" ? (
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-32 items-center justify-center bg-paper/5 text-xs uppercase text-ink/60"
                  >
                    PDF Document
                  </a>
                ) : (
                  <div
                    className="h-32 bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.file_url})` }}
                  />
                )}
                <div className="flex items-center justify-between p-2">
                  <p className="truncate text-xs text-ink/70">{item.title || "Untitled"}</p>
                  <form action={remove}>
                    <button type="submit" className="text-xs text-ink/40 hover:text-magenta">
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>

        <form action={addPortfolioItem} className="mt-6 grid gap-3 rounded-2xl border border-line p-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs text-ink/50">File (image or PDF)</span>
            <input
              type="file"
              name="file"
              required
              accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
              className="mt-1.5 w-full text-sm text-ink file:mr-3 file:rounded-full file:border file:border-line file:bg-transparent file:px-4 file:py-1.5 file:text-xs file:uppercase file:text-ink"
            />
          </label>
          <label className="block">
            <span className="text-xs text-ink/50">Title (optional)</span>
            <input
              name="title"
              className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2 text-sm text-ink outline-none focus:border-brand"
            />
          </label>
          <label className="block">
            <span className="text-xs text-ink/50">Link (optional)</span>
            <input
              name="link_url"
              type="url"
              placeholder="https://…"
              className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2 text-sm text-ink outline-none focus:border-brand"
            />
          </label>
          <button
            type="submit"
            className="col-span-full rounded-full border border-line px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink hover:border-volt"
          >
            Add to Portfolio
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-ink outline-none focus:border-brand"
      />
    </label>
  );
}
