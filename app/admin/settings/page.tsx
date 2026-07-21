import { FileText, Trash2 } from "lucide-react";
import { getSitePage } from "@/lib/site-pages";
import { getBranding } from "@/lib/branding";
import { createClient } from "@/lib/supabase/server";
import { listPublicMedia } from "@/lib/storage";
import { SettingsTabs } from "@/components/settings-tabs";
import {
  updateContactInfo,
  updateSocialLinks,
  updateBranding,
  deleteMediaAsset,
} from "@/app/admin/settings/actions";
import { InstagramIcon, TikTokIcon, LinkedInIcon, WhatsAppIcon, YouTubeIcon } from "@/components/social-icons";

type ContactContent = {
  intro?: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  support_hours?: string | null;
};

type SocialEntry = { url: string; enabled: boolean };
type SocialContent = Record<string, SocialEntry>;

const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: InstagramIcon, placeholder: "https://instagram.com/…" },
  { key: "tiktok", label: "TikTok", icon: TikTokIcon, placeholder: "https://tiktok.com/@…" },
  { key: "linkedin", label: "LinkedIn", icon: LinkedInIcon, placeholder: "https://linkedin.com/company/…" },
  { key: "whatsapp", label: "WhatsApp", icon: WhatsAppIcon, placeholder: "https://wa.me/…" },
  { key: "youtube", label: "YouTube", icon: YouTubeIcon, placeholder: "https://youtube.com/@…" },
] as const;

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error } = await searchParams;
  const supabase = await createClient();
  const [contactPage, socialPage, branding, media] = await Promise.all([
    getSitePage<ContactContent>("contact"),
    getSitePage<SocialContent>("social_links"),
    getBranding(),
    listPublicMedia(supabase),
  ]);
  const contact = contactPage?.content ?? {};
  const social = socialPage?.content ?? {};

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Platform Settings</h1>
      <p className="mt-2 text-sm text-ink/50">
        Manage contact info, social links, media library, and brand appearance.
      </p>

      <SettingsTabs
        general={
          <div className="max-w-2xl space-y-6">
            {saved === "contact" && (
              <p className="rounded-lg border border-green/40 bg-green/10 px-4 py-3 text-sm text-green">
                Contact info saved.
              </p>
            )}
            {saved === "social" && (
              <p className="rounded-lg border border-green/40 bg-green/10 px-4 py-3 text-sm text-green">
                Social links saved.
              </p>
            )}

            <form action={updateContactInfo} className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-ink">Contact Information</h2>
              <p className="mt-1 text-xs text-ink/50">Shown on the Contact and Help Center pages.</p>
              <input type="hidden" name="intro" value={contact.intro ?? ""} />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Support Email" name="email" defaultValue={contact.email ?? ""} />
                <Field label="Support Phone" name="phone" defaultValue={contact.phone ?? ""} />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Business Address" name="location" defaultValue={contact.location ?? ""} />
                <Field
                  label="Support Hours"
                  name="support_hours"
                  defaultValue={contact.support_hours ?? ""}
                />
              </div>
              <button
                type="submit"
                className="mt-5 rounded-full bg-grad-volt px-6 py-3 text-xs font-bold uppercase tracking-wide text-ink shadow-sm transition hover:opacity-90"
              >
                Save Contact Info
              </button>
            </form>

            <form action={updateSocialLinks} className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-ink">Social Media Links</h2>
              <p className="mt-1 text-xs text-ink/50">
                Appears in the footer across all public pages. Toggle off to hide a platform.
              </p>
              <div className="mt-5 space-y-3">
                {SOCIAL_PLATFORMS.map((p) => {
                  const entry = social[p.key];
                  const Icon = p.icon;
                  return (
                    <div key={p.key} className="flex items-center gap-3.5 rounded-xl border border-line p-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg text-brand">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="w-20 shrink-0 text-xs font-bold">{p.label}</span>
                      <input
                        name={`${p.key}_url`}
                        defaultValue={entry?.url ?? ""}
                        placeholder={p.placeholder}
                        className="flex-1 rounded-lg border border-line px-3.5 py-2 text-sm outline-none focus:border-brand"
                      />
                      <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                        <input
                          type="checkbox"
                          name={`${p.key}_enabled`}
                          defaultChecked={entry?.enabled ?? false}
                          className="peer sr-only"
                        />
                        <div className="h-[22px] w-[38px] rounded-full bg-line transition peer-checked:bg-grad-volt" />
                        <div className="absolute left-0.5 top-0.5 h-[18px] w-[18px] rounded-full bg-paper shadow transition peer-checked:translate-x-4" />
                      </label>
                    </div>
                  );
                })}
              </div>
              <button
                type="submit"
                className="mt-5 rounded-full bg-grad-volt px-6 py-3 text-xs font-bold uppercase tracking-wide text-ink shadow-sm transition hover:opacity-90"
              >
                Save Social Links
              </button>
            </form>
          </div>
        }
        media={
          <div>
            <p className="text-xs text-ink/50">
              {media.length} file{media.length === 1 ? "" : "s"} — avatars, cover photos,
              portfolio pieces, and service/project images uploaded by everyone on the platform.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {media.map((asset) => {
                const del = deleteMediaAsset.bind(null, asset.path);
                return (
                  <div
                    key={asset.path}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-bg"
                  >
                    {asset.kind === "image" ? (
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${asset.url})` }}
                      />
                    ) : (
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink/40 hover:text-brand"
                      >
                        <FileText className="h-6 w-6" />
                        <span className="text-[10px] font-semibold uppercase">PDF</span>
                      </a>
                    )}
                    <form
                      action={del}
                      className="absolute inset-x-0 bottom-0 flex justify-center bg-ink/75 py-1.5 opacity-0 transition group-hover:opacity-100"
                    >
                      <button
                        type="submit"
                        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-paper hover:text-magenta"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </form>
                  </div>
                );
              })}
              {!media.length && (
                <p className="col-span-full text-sm text-ink/40">No uploads yet.</p>
              )}
            </div>
          </div>
        }
        branding={
          <div className="max-w-2xl space-y-6">
            {saved === "branding" && (
              <p className="rounded-lg border border-green/40 bg-green/10 px-4 py-3 text-sm text-green">
                Branding saved — changes are live across the site.
              </p>
            )}
            {error === "branding" && (
              <p className="rounded-lg border border-magenta/40 bg-magenta/10 px-4 py-3 text-sm text-magenta">
                Colors must be valid hex codes (e.g. #851490).
              </p>
            )}

            <form action={updateBranding} className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-ink">Accent Colors</h2>
              <p className="mt-1 text-xs text-ink/50">
                Changes the primary and accent color across the entire live site, including
                gradients, buttons, and links.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <ColorField label="Primary (Nyx Vision Purple)" name="color_brand" defaultValue={branding.color_brand} />
                <ColorField label="Accent (Doer Orange)" name="color_volt" defaultValue={branding.color_volt} />
              </div>

              <h2 className="mt-7 text-sm font-semibold text-ink">Logo</h2>
              <p className="mt-1 text-xs text-ink/50">
                Two variants are used across the site — a dark mark for light backgrounds (the
                main nav) and a light mark for dark backgrounds (footer, auth screens).
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <LogoField
                  label="Dark mark (light backgrounds)"
                  name="logo_dark"
                  currentUrl={branding.logo_dark_url}
                  previewBg="bg-paper"
                />
                <LogoField
                  label="Light mark (dark backgrounds)"
                  name="logo_light"
                  currentUrl={branding.logo_light_url}
                  previewBg="bg-ink"
                />
              </div>

              <button
                type="submit"
                className="mt-6 rounded-full bg-grad-volt px-6 py-3 text-xs font-bold uppercase tracking-wide text-ink shadow-sm transition hover:opacity-90"
              >
                Save Branding
              </button>
            </form>
          </div>
        }
      />
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-wide text-ink/50">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="mt-1.5 w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-brand"
      />
    </label>
  );
}

function ColorField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-wide text-ink/50">{label}</span>
      <div className="mt-1.5 flex items-center gap-2.5 rounded-lg border border-line px-3 py-2">
        <input
          type="color"
          name={name}
          defaultValue={defaultValue}
          className="h-7 w-7 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <span className="font-mono text-sm text-ink/70">{defaultValue}</span>
      </div>
    </label>
  );
}

function LogoField({
  label,
  name,
  currentUrl,
  previewBg,
}: {
  label: string;
  name: string;
  currentUrl: string | null;
  previewBg: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-wide text-ink/50">{label}</span>
      <div
        className={`mt-1.5 flex h-16 items-center justify-center rounded-lg border border-line px-4 ${previewBg}`}
      >
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUrl} alt="" className="h-8 w-auto" />
        ) : (
          <span className="text-[11px] text-ink/30">Using default logo</span>
        )}
      </div>
      <input
        type="file"
        name={name}
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="mt-1.5 w-full text-xs text-ink/60 file:mr-3 file:rounded-full file:border-0 file:bg-bg file:px-3 file:py-1.5 file:text-[11px] file:font-bold file:uppercase file:tracking-wide file:text-ink"
      />
    </label>
  );
}
