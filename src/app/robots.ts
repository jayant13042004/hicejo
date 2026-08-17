import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hicejo.com";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/tools/*", "/templates/*", "/blog/*", "/login", "/register"],
      disallow: ["/api/*", "/dashboard/*"]
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
