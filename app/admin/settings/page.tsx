import { ImageIcon, Palette } from "lucide-react";
import { getSitePage } from "@/lib/site-pages";
import { SettingsTabs } from "@/components/settings-tabs";
import { updateContactInfo, updateSocialLinks } from "@/app/admin/settings/actions";
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
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const [contactPage, socialPage] = await Promise.all([
    getSitePage<ContactContent>("contact"),
    getSitePage<SocialContent>("social_links"),
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
          <ComingSoonPanel
            icon={ImageIcon}
            title="Media Library"
            body="A site-wide image manager — browse, replace, and delete every uploaded asset from one place — is planned but not built yet."
          />
        }
        branding={
          <ComingSoonPanel
            icon={Palette}
            title="Branding"
            body="Live-editable accent colors, typography pairing, and logo replacement are planned but not built yet. For now, brand changes are made directly in code."
          />
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

function ComingSoonPanel({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-xl rounded-2xl border border-line bg-paper p-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="font-display mt-4 text-lg text-ink">{title}</h2>
      <span className="mt-2 inline-block rounded-full bg-ink/8 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink/55">
        Coming soon
      </span>
      <p className="mt-3 text-sm leading-relaxed text-ink/55">{body}</p>
    </div>
  );
}
