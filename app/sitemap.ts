import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = "https://chub.nyxcollective.africa";

const STATIC_ROUTES = [
  "",
  "/about",
  "/faq",
  "/contact",
  "/services",
  "/creatives",
  "/projects",
  "/blog",
  "/financial-products",
  "/terms",
  "/privacy-policy",
  "/help-center",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: services }, { data: projects }, { data: creatives }, { data: posts }] =
    await Promise.all([
      supabase.from("services").select("slug, updated_at").eq("status", "published"),
      supabase.from("projects").select("slug, updated_at").eq("status", "published"),
      supabase.from("public_profiles").select("username").eq("role", "creative"),
      supabase.from("blog_posts").select("slug, updated_at").eq("status", "published"),
    ]);

  const staticEntries = STATIC_ROUTES.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  const serviceEntries = (services ?? []).map((s) => ({
    url: `${BASE_URL}/services/${s.slug}`,
    lastModified: s.updated_at ? new Date(s.updated_at) : undefined,
  }));

  const projectEntries = (projects ?? []).map((p) => ({
    url: `${BASE_URL}/projects/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
  }));

  const creativeEntries = (creatives ?? []).map((c) => ({
    url: `${BASE_URL}/creatives/${c.username}`,
  }));

  const postEntries = (posts ?? []).map((b) => ({
    url: `${BASE_URL}/blog/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : undefined,
  }));

  return [...staticEntries, ...serviceEntries, ...projectEntries, ...creativeEntries, ...postEntries];
}
