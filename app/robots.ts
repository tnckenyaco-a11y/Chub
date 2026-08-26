import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/admin",
        "/api",
        "/checkout",
        "/sign-in",
        "/sign-up",
        "/forgot-password",
        "/reset-password",
        "/auth",
      ],
    },
    sitemap: "https://chub.nyxcollective.africa/sitemap.xml",
  };
}
